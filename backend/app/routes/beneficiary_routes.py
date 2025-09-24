from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import httpx

from ..database import get_db
from ..models.user import User
from ..models.beneficiary import Beneficiary
from ..schemas.beneficiary_schema import (
    BeneficiaryCreate, 
    BeneficiaryUpdate, 
    BeneficiaryResponse
)
from ..services.auth_service import get_current_active_user
from ..utils.validators import validate_ifsc_code, validate_account_number

router = APIRouter()


@router.get("/", response_model=List[BeneficiaryResponse])
async def get_beneficiaries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all beneficiaries for current user"""
    
    query = db.query(Beneficiary).filter(Beneficiary.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Beneficiary.is_active == True)
    
    beneficiaries = query.offset(skip).limit(limit).all()
    return beneficiaries


@router.get("/{beneficiary_id}", response_model=BeneficiaryResponse)
async def get_beneficiary(
    beneficiary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific beneficiary by ID"""
    
    beneficiary = db.query(Beneficiary).filter(
        Beneficiary.id == beneficiary_id,
        Beneficiary.user_id == current_user.id
    ).first()
    
    if not beneficiary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    return beneficiary


@router.post("/", response_model=BeneficiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_beneficiary(
    beneficiary: BeneficiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new beneficiary"""
    
    # Validate IFSC and account number
    if not validate_ifsc_code(beneficiary.ifsc_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid IFSC code format"
        )
    
    if not validate_account_number(beneficiary.account_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account number"
        )
    
    # Check for duplicate account number for this user
    existing = db.query(Beneficiary).filter(
        Beneficiary.user_id == current_user.id,
        Beneficiary.account_number == beneficiary.account_number,
        Beneficiary.ifsc_code == beneficiary.ifsc_code.upper()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beneficiary with this account already exists"
        )
    
    # Create beneficiary
    db_beneficiary = Beneficiary(
        user_id=current_user.id,
        **beneficiary.dict()
    )
    
    db.add(db_beneficiary)
    db.commit()
    db.refresh(db_beneficiary)
    
    return db_beneficiary


@router.put("/{beneficiary_id}", response_model=BeneficiaryResponse)
async def update_beneficiary(
    beneficiary_id: int,
    beneficiary_update: BeneficiaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update beneficiary"""
    
    # Get existing beneficiary
    db_beneficiary = db.query(Beneficiary).filter(
        Beneficiary.id == beneficiary_id,
        Beneficiary.user_id == current_user.id
    ).first()
    
    if not db_beneficiary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    # Validate fields if provided
    if beneficiary_update.ifsc_code and not validate_ifsc_code(beneficiary_update.ifsc_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid IFSC code format"
        )
    
    if beneficiary_update.account_number and not validate_account_number(beneficiary_update.account_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account number"
        )
    
    # Update fields
    update_data = beneficiary_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_beneficiary, field, value)
    
    db.commit()
    db.refresh(db_beneficiary)
    
    return db_beneficiary


@router.delete("/{beneficiary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_beneficiary(
    beneficiary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete beneficiary (soft delete by setting is_active to False)"""
    
    db_beneficiary = db.query(Beneficiary).filter(
        Beneficiary.id == beneficiary_id,
        Beneficiary.user_id == current_user.id
    ).first()
    
    if not db_beneficiary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    # Soft delete
    db_beneficiary.is_active = False
    db.commit()
    
    return None


@router.get("/ifsc/{ifsc_code}")
async def get_bank_details_by_ifsc(
    ifsc_code: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get bank details by IFSC code using Razorpay API"""
    
    # Validate IFSC code format
    if not validate_ifsc_code(ifsc_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid IFSC code format"
        )
    
    try:
        # Call Razorpay IFSC API
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ifsc.razorpay.com/{ifsc_code.upper()}")
            
            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="IFSC code not found"
                )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Unable to fetch bank details"
                )
            
            bank_data = response.json()
            
            # Extract address from the response
            address_parts = []
            if bank_data.get('ADDRESS'):
                address_parts.append(bank_data['ADDRESS'])
            if bank_data.get('CITY'):
                address_parts.append(bank_data['CITY'])
            if bank_data.get('DISTRICT'):
                address_parts.append(bank_data['DISTRICT'])
            if bank_data.get('STATE'):
                address_parts.append(bank_data['STATE'])
            
            bank_address = ', '.join(address_parts) if address_parts else ''
            
            return {
                "bank_name": bank_data.get('BANK', ''),
                "branch_name": bank_data.get('BRANCH', ''),
                "bank_address": bank_address,
                "ifsc_code": ifsc_code.upper(),
                "city": bank_data.get('CITY', ''),
                "district": bank_data.get('DISTRICT', ''),
                "state": bank_data.get('STATE', ''),
                "contact": bank_data.get('CONTACT', ''),
            }
            
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to connect to bank details service"
        )
