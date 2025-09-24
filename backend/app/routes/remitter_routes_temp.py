from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.remitter import Remitter
from ..models.user import User
from ..schemas.remitter_schema import RemitterCreate, RemitterUpdate, RemitterResponse

router = APIRouter(tags=["remitter"])

# Temporary: hardcoded user ID for testing (use the first user)
def get_test_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found. Please create an account first.")
    return user


@router.get("/me", response_model=Optional[RemitterResponse])
async def get_my_bank_details(
    current_user: User = Depends(get_test_user),
    db: Session = Depends(get_db)
):
    """Get current user's bank details (remitter information)"""
    remitter = db.query(Remitter).filter(Remitter.user_id == current_user.id).first()
    return remitter


@router.post("/", response_model=RemitterResponse, status_code=status.HTTP_201_CREATED)
async def create_bank_details(
    remitter_data: RemitterCreate,
    current_user: User = Depends(get_test_user),
    db: Session = Depends(get_db)
):
    """Create bank details for current user"""
    # Check if user already has bank details
    existing_remitter = db.query(Remitter).filter(Remitter.user_id == current_user.id).first()
    if existing_remitter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bank details already exist. Use PUT to update."
        )
    
    # Create new remitter record
    db_remitter = Remitter(
        user_id=current_user.id,
        **remitter_data.model_dump()
    )
    db.add(db_remitter)
    db.commit()
    db.refresh(db_remitter)
    
    return db_remitter


@router.put("/", response_model=RemitterResponse)
async def update_bank_details(
    remitter_data: RemitterUpdate,
    current_user: User = Depends(get_test_user),
    db: Session = Depends(get_db)
):
    """Update current user's bank details"""
    remitter = db.query(Remitter).filter(Remitter.user_id == current_user.id).first()
    if not remitter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank details not found. Use POST to create."
        )
    
    # Update only provided fields
    update_data = remitter_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(remitter, field, value)
    
    db.commit()
    db.refresh(remitter)
    
    return remitter


@router.delete("/")
async def delete_bank_details(
    current_user: User = Depends(get_test_user),
    db: Session = Depends(get_db)
):
    """Delete current user's bank details"""
    remitter = db.query(Remitter).filter(Remitter.user_id == current_user.id).first()
    if not remitter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank details not found"
        )
    
    db.delete(remitter)
    db.commit()
    
    return {"message": "Bank details deleted successfully"}