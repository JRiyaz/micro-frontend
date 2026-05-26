# Walkthrough: Modern Secure Microservices Backend Implementation

This document provides a detailed walkthrough of the complete decoupled, secure, and asynchronous **Micro-Backends & Micro-Databases Architecture** implemented inside your monorepo. This replaces the legacy monolithic `json-server` (`db.json`) mock setup with state-of-the-art Python 3.12+ (strictly featuring modern PEP 695 type aliases, inline generics, and type union syntax) backends.

---

## 1. Monorepo Microservices Architecture & API Gateway

The system consists of four independent Angular Micro-Frontends (MFEs) federated at runtime, a central **API Gateway** proxy, and three highly autonomous microservice backends, each segregated with its own private SQLite database file to prevent cross-database joins:

```mermaid
graph TD
    subgraph Client Application Layer (Micro-Frontends)
        Shell["MFE Shell (Port 4200)"]
        UserFE["user-service MFE (Port 4201)"]
        InvFE["inventory-hub MFE (Port 4202)"]
        StoreFE["store-service MFE (Port 4203)"]
        
        Shell -.->|Federated Runtime Imports| UserFE
        Shell -.->|Federated Runtime Imports| InvFE
        Shell -.->|Federated Runtime Imports| StoreFE
    end

    subgraph API Gateway Proxy (Port 3000)
        Gateway["FastAPI API Gateway"]
    end

    subgraph Microservices Backend APIs (FastAPI)
        UserAPI["User Service (Port 8001)"] --> DB_User[("user.db (SQLite)")]
        InvAPI["Inventory Service (Port 8002)"] --> DB_Inv[("inventory.db (SQLite)")]
        StoreAPI["Store Service (Port 8003)"] --> DB_Store[("orders.db (SQLite)")]
    end

    Shell & UserFE & InvFE & StoreFE -->|HTTP Queries on Port 3000| Gateway
    
    Gateway -->|Proxy /auth & /user| UserAPI
    Gateway -->|Proxy /products & /po| InvAPI
    Gateway -->|Proxy /orders & /payments| StoreAPI
    
    Shell & UserFE -->|Real WebSockets direct connection| UserAPI
    StoreAPI -->|SSRF-Safe HTTP Deductions| InvAPI
```

*   **API Gateway (Port 3000)**: Serves as a dynamic reverse-proxy intercepting all HTTP calls. It routes them dynamically using `httpx` to their respective microservices. This guarantees 100% backward-compatibility for all Angular components, allowing them to communicate seamlessly without changing a single line of frontend API TypeScript code!

---

## 2. Service-by-Service Technical Specification

All backends are structured directly inside their module folders under a private `backend/` directory, completely avoiding generic `src` packaging:

### A. User & Authentication Service (`projects/user-service/backend`)
*   **Purpose**: Manages JWT authentication issuance, user profile role states, administrative suspensions, transactional audit logs, and WebSockets-based live chat support.
*   **File Architecture**:
    *   `user/app.py`: FastAPI server configuration, request profiling, CORS, and robust `TraceFormatter` logging.
    *   `user/config.py`: Tunable environments via `pydantic-settings` (database url, JWT secret, rate-limiting variables).
    *   `user/database.py`: Async SQLite engine and configurable table initialization drop/recreation hooks.
    *   `user/models/domain.py`: SQLModel definitions for `User` and `AuditLog` (utilizing UTC tz-aware times).
    *   `user/routers/v1/auth.py`: Registration, login, and first-registrant automatic Admin bootstrapping.
    *   `user/routers/v1/user.py`: Profile retrieval, Admin role updates, status suspensions, and paginated audit listings.
    *   `user/routers/v1/chat.py`: Real-time WebSocket connection manager mapping sockets by username/role to route customer support messages to active agents.
    *   `user/utils/`: Security utils, Sanitizer annotation, and global Rate Limiter.

### B. Inventory & Supply Chain Service (`projects/inventory-hub/backend`)
*   **Purpose**: Handles products catalog, warehouse capacities, stock levels, stock movement logs, and purchase orders (POs) procurement.
*   **File Architecture**:
    *   `inventory/app.py`: FastAPI server configuration.
    *   `inventory/models/domain.py`: Relational SQLModel tables for `Product`, `Warehouse`, `StockLevel`, `StockMovement`, `Supplier`, `PurchaseOrder`, and `PurchaseOrderItem`.
    *   `inventory/routers/v1/products.py`: Paginated CRUD endpoints supporting query search filters.
    *   `inventory/routers/v1/warehouses.py` & `suppliers.py`: Warehouse facility operations and supplier registers.
    *   `inventory/routers/v1/stock.py`: Transaction-safe adjustments that verify target fields, compute final stocks, block negative values, and write outbox audit records.
    *   `inventory/routers/v1/po.py`: Procurement order workflows. When a PO status is updated to `"Received"`, the system automatically increments local warehouse stock levels and generates movements logs.

### C. Storefront & Sales Service (`projects/store-service/backend`)
*   **Purpose**: Manages customer billing profiles, checkout orders creation, payment ledger operations, inter-service stock reservation, and print-ready receipt invoice generation.
*   **File Architecture**:
    *   `store/app.py`: FastAPI server definition.
    *   `store/models/domain.py`: Denormalized local models `Customer`, `SalesOrder`, `SalesOrderItem`, and `SalesPayment` guaranteeing read consistency and zero cross-database queries.
    *   `store/routers/v1/orders.py`: Orders checkout submissions. It calls the remote Inventory Service (`http://localhost:8002/api/v1/stock/adjust`) in real time to reserve stock, aborting the checkout if inventory is unavailable. Renders glassmorphic invoices at `/orders/{id}/invoice`.
    *   `store/routers/v1/payments.py` & `customers.py`: Capture payments (updating order payment flags) and customer registers.
    *   `store/utils/ssrf.py`: Intercepts outbound URLs, resolves hostnames to IPs via DNS, and blocks private/cloud metadata ranges to prevent Server-Side Request Forgery. Allows `localhost` in development environment only.

---

## 3. High-Density Security & Engineering Standards

### 🔒 SSRF Defense-in-Depth
Internal inter-service queries are securely validated prior to execution:
```python
# store/utils/ssrf.py
addr_info = socket.getaddrinfo(hostname, port)
for res in addr_info:
    ip = ipaddress.ip_address(res[4][0])
    if ip.is_private or ip.is_loopback or ip.is_link_local:
        return False
```

### ⏱️ Global Sliding Window Rate Limiting
Client requests are throttled per IP address using a premium in-memory sliding window rate limiter:
```python
# store/utils/rate_limiter.py
cutoff = current_time - self.window_seconds
while timestamps and timestamps[0] < cutoff:
    timestamps.pop(0)
if len(timestamps) >= self.requests:
    raise HTTPException(status_code=429, detail="Rate limit exceeded")
```
*Toggles and thresholds are fully tunable inside local `.env` files.*

### 🆔 X-Correlation-ID Request Tracing
A unique `X-Correlation-ID` header is attached to every HTTP request, allowing effortless trace tracking of logs across the distributed microservices.

---

## 4. Run Scripts & Execution Instructions

To make starting both the federated frontends and the python backends effortless, I integrated new concurrent scripts inside your root `@package.json`.

### A. Start the Entire Microservice Ecosystem Concurrently
To start all four Angular MFEs, the reverse-proxy API Gateway on Port 3000, and all three Python API servers concurrently, simply execute:
```bash
pnpm start:all-micro
```
*   *(This launches the Shell, User MFE, Store MFE, Inventory MFE, User Service, Inventory Service, Store Service, and the API Gateway concurrently using a color-coded log aggregator)*

### B. Start with JSON-Server Mock DB Only (Frontend-Only Mode)
If you want to run the frontends entirely on local mock data (e.g. for purely client-side iterations without launching python environments), execute:
```bash
pnpm start:frontend-mock
```
*   *(This concurrently launches all four Angular MFEs alongside the mock `json-server` running on Port 3000, watching `db.json`)*

### C. Start Python Backends & Gateway ONLY
To start all three Python API services and the API Gateway concurrently (Ports 3000, 8001, 8002, 8003), run:
```bash
pnpm start:backends
```

### D. Start a Specific Service Individually
*   **API Gateway** (Port 3000): `pnpm start:py-gateway`
*   **User API** (Port 8001): `pnpm start:py-user`
*   **Inventory API** (Port 8002): `pnpm start:py-inventory`
*   **Store API** (Port 8003): `pnpm start:py-store`
