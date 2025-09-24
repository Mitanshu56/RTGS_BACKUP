from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config import settings
from .database import create_tables
# Create uploads directory if it doesn't exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.template_dir, exist_ok=True)

app = FastAPI(
    title=settings.app_name,
    description="RTGS Automation Web Application API",
    version="1.0.0",
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Include routers
from .routes.auth_routes import router as auth_router
from .routes.beneficiary_routes import router as beneficiary_router
from .routes.transaction_routes import router as transaction_router
from .routes.pdf_routes import router as pdf_router
from .routes.remitter_routes import router as remitter_router

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(beneficiary_router, prefix="/api/beneficiaries", tags=["beneficiaries"])
app.include_router(transaction_router, prefix="/api/transactions", tags=["transactions"])
app.include_router(pdf_router, prefix="/api/pdf", tags=["pdf"])
app.include_router(remitter_router, prefix="/api/remitter", tags=["remitter"])


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    create_tables()


@app.get("/")
async def root():
    return {
        "message": "Welcome to RTGS Automation API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
