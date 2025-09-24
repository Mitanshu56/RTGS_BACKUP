from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.user import User
from ..services.auth_service import get_current_active_user

router = APIRouter(tags=["debug"])

@router.get("/test-auth")
async def test_authentication(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test endpoint to debug authentication"""
    return {
        "message": "Authentication successful",
        "user_id": current_user.id,
        "user_email": current_user.email,
        "is_active": current_user.is_active
    }