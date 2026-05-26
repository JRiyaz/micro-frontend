import time
import logging
import json
from fastapi import FastAPI, Request, Response, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Configure basic structured logging format
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] gateway - %(message)s")
logger = logging.getLogger("api-gateway")

app = FastAPI(
    title="Microservices API Gateway",
    description="OWASP-hardened reverse-proxy routing requests on Port 3000 to decoupled microservices."
)

app.add_middleware(
    CORSMiddleware,
    # In cookie auth, allow_origins should specify the exact origin rather than "*" 
    # to support allow_credentials=True seamlessly.
    allow_origins=["http://localhost:4200", "http://localhost:4201", "http://localhost:4202", "http://localhost:4203"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared httpx AsyncClient to reuse connection pools
async_client = httpx.AsyncClient()

# Path to Port mapping configuration
SERVICE_MAPPING = {
    "auth": "http://localhost:8001/api/v1",
    "user": "http://localhost:8001/api/v1",
    "users": "http://localhost:8001/api/v1/user",
    "products": "http://localhost:8002/api/v1",
    "warehouses": "http://localhost:8002/api/v1",
    "suppliers": "http://localhost:8002/api/v1",
    "po": "http://localhost:8002/api/v1",
    "customers": "http://localhost:8003/api/v1",
    "orders": "http://localhost:8003/api/v1",
    "payments": "http://localhost:8003/api/v1",
}

# Configuration-driven IP Banning State (In-Memory sliding logs)
RATE_LIMIT_BAN_ENABLED = True
BAN_THRESHOLD = 5  # Number of HTTP 429s before trigger a ban
BAN_DURATION_SECONDS = 900  # 15 minutes ban duration

ip_violation_attempts: dict[str, int] = {}
ip_banned_until: dict[str, float] = {}

@app.on_event("shutdown")
async def shutdown_event():
    await async_client.aclose()

@app.middleware("http")
async def gateway_security_border_middleware(request: Request, call_next):
    """
    Security border intercepting traffic before proxy routing.
    Protects downstream microservices from banned/abusive IP addresses.
    """
    if not RATE_LIMIT_BAN_ENABLED:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()

    # Assert if IP is currently banned
    if client_ip in ip_banned_until:
        banned_until = ip_banned_until[client_ip]
        if current_time < banned_until:
            retry_after = int(banned_until - current_time)
            logger.warning(f"[Security Guard] Request blocked from banned IP: {client_ip}. Remaining: {retry_after}s")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: IP temporarily banned due to excessive rate limit violations. Try again in {retry_after} seconds."
            )
        else:
            # Ban expired, release IP
            del ip_banned_until[client_ip]
            ip_violation_attempts[client_ip] = 0

    return await call_next(request)

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_proxy(path: str, request: Request):
    """
    Catch-all reverse-proxy routing requests dynamically to target microservices.
    Enforces HttpOnly Cookie Auth (OWASP Guard) and tracks downstream rate-limiting violations.
    """
    client_ip = request.client.host if request.client else "unknown"
    parts = path.strip("/").split("/")
    prefix = parts[0] if parts else ""

    target_base = SERVICE_MAPPING.get(prefix)
    if not target_base:
        target_base = "http://localhost:8002/api/v1"

    subpath = path
    if prefix == "users":
        subpath = path.replace("users", "list", 1) if len(parts) == 1 else path.replace("users", "", 1)
        target_url = f"{target_base.rstrip('/')}/{subpath.lstrip('/')}"
    else:
        target_url = f"{target_base.rstrip('/')}/{path.lstrip('/')}"

    # Extract headers
    headers = dict(request.headers)
    headers.pop("host", None)

    # OWASP Guard: If session cookie is present, inject it as downstream Bearer Auth!
    session_token = request.cookies.get("session_token")
    if session_token:
        headers["authorization"] = f"Bearer {session_token}"

    params = dict(request.query_params)
    body = await request.body()

    logger.info(f"Routing {request.method} /{path} -> {target_url}")

    try:
        resp = await async_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=params,
            content=body,
            timeout=10.0
        )
        
        # Track rate limit violations (HTTP 429) returned by downstream microservices
        if resp.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            ip_violation_attempts[client_ip] = ip_violation_attempts.get(client_ip, 0) + 1
            logger.warning(f"[Rate Limiter Monitor] IP {client_ip} triggered 429. Violations: {ip_violation_attempts[client_ip]}/{BAN_THRESHOLD}")
            
            if ip_violation_attempts[client_ip] >= BAN_THRESHOLD:
                ban_expiry = time.time() + BAN_DURATION_SECONDS
                ip_banned_until[client_ip] = ban_expiry
                logger.error(f"[Security Guard] IP {client_ip} has been BANNED for 15 minutes due to rate-limit abuse.")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="IP temporarily banned due to excessive rate limit violations."
                )
        elif resp.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED):
            # Reset attempts on successful transactions
            ip_violation_attempts[client_ip] = max(0, ip_violation_attempts.get(client_ip, 0) - 1)

        # Build response headers
        resp_headers = dict(resp.headers)
        
        # Intercept auth login/register response to implement HttpOnly Cookie Auth!
        if path in ("auth/login", "auth/register") and resp.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED):
            try:
                payload = resp.json()
                token = payload.get("access_token")
                
                if token:
                    # Strip access token from JSON body so client-side JavaScript cannot access it!
                    clean_payload = {k: v for k, v in payload.items() if k != "access_token"}
                    clean_content = json.dumps(clean_payload).encode("utf-8")
                    
                    response = Response(
                        content=clean_content,
                        status_code=resp.status_code,
                        headers=resp_headers
                    )
                    
                    # Set access token inside secure HttpOnly Cookie
                    response.set_cookie(
                        key="session_token",
                        value=token,
                        httponly=True,
                        samesite="strict",
                        path="/"
                        # secure=True  # In production, set to True for HTTPS
                    )
                    
                    logger.info(f"[OWASP Guard] Intercepted {path}. Access token securely stored inside HttpOnly Cookie.")
                    return response
            except Exception as e:
                logger.error(f"Failed to parse login response payload: {e}")

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=resp_headers
        )

    except httpx.RequestError as exc:
        logger.error(f"Failed to connect to microservice: {exc}")
        return Response(
            content=f'{{"detail": "Microservice gateway timeout: {exc}"}}',
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            headers={"Content-Type": "application/json"}
        )
