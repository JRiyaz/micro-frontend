import uvicorn

if __name__ == "__main__":
    # Start microservices API gateway reverse proxy on Port 3000
    uvicorn.run(
        "gateway.app:app",
        host="0.0.0.0",
        port=3000,
        reload=True
    )
