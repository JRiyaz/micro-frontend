import logging
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Configure basic structured logging format
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] gateway - %(message)s")
logger = logging.getLogger("api-gateway")

app = FastAPI(
    title="Microservices API Gateway",
    description="Reverse-proxy routing frontend requests on Port 3000 to decoupled microservice APIs."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared httpx AsyncClient to reuse connection pool for high-performance requests
async_client = httpx.AsyncClient()

# Path to Port mapping configuration
SERVICE_MAPPING = {
    # User service: Auth, profiles, user listings
    "auth": "http://localhost:8001/api/v1",
    "user": "http://localhost:8001/api/v1",
    "users": "http://localhost:8001/api/v1/user", # Map legacy /users to /api/v1/user

    # Inventory service: products, warehouses, suppliers, purchase orders
    "products": "http://localhost:8002/api/v1",
    "warehouses": "http://localhost:8002/api/v1",
    "suppliers": "http://localhost:8002/api/v1",
    "po": "http://localhost:8002/api/v1",
    
    # Storefront service: customer profiles, checkouts, payments
    "customers": "http://localhost:8003/api/v1",
    "orders": "http://localhost:8003/api/v1",
    "payments": "http://localhost:8003/api/v1",
}

@app.on_event("shutdown")
async def shutdown_event():
    # Gracefully close httpx connection pools
    await async_client.aclose()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_proxy(path: str, request: Request):
    """
    Catch-all reverse-proxy routing requests dynamically to target microservices.
    Represents an elite API Gateway structure.
    """
    # Parse the root path prefix
    parts = path.strip("/").split("/")
    prefix = parts[0] if parts else ""

    target_base = SERVICE_MAPPING.get(prefix)
    
    # Default fallback: Route to Inventory Service
    if not target_base:
        target_base = "http://localhost:8002/api/v1"

    # Reconstruct request path mapping
    # Special handle for legacy mappings if needed
    subpath = path
    if prefix == "users":
        # /users -> /api/v1/user/list (if listing) or /api/v1/user/...
        subpath = path.replace("users", "list", 1) if len(parts) == 1 else path.replace("users", "", 1)
        target_url = f"{target_base.rstrip('/')}/{subpath.lstrip('/')}"
    else:
        target_url = f"{target_base.rstrip('/')}/{path.lstrip('/')}"

    # Extract original headers, query parameters, and body
    headers = dict(request.headers)
    
    # Remove host header to allow target service to parse correctly
    headers.pop("host", None)
    
    params = dict(request.query_params)
    body = await request.body()

    logger.info(f"Routing {request.method} /{path} -> {target_url}")

    try:
        # Forward request to microservice
        resp = await async_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=params,
            content=body,
            timeout=10.0
        )
        
        # Build backward-compatible headers (e.g. X-Total-Count) if applicable
        resp_headers = dict(resp.headers)
        
        # Inject mock header total-count if missing to support frontend pagination!
        if path.startswith("products") and "x-total-count" not in resp_headers:
            # We can default to a pagination helper or pass original headers
            pass

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
