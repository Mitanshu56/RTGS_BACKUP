from pydantic import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./rtgs_automation.db"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS - using simple list
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "*"]
    
    # App
    app_name: str = "RTGS Automation App"
    
    # File Configuration
    upload_dir: str = "./uploads"
    template_dir: str = "./templates"
    
    # Security Configuration
    allowed_hosts: List[str] = ["localhost", "127.0.0.1"]
    
    class Config:
        env_file = ".env"


settings = Settings()
