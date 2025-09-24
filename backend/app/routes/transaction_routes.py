from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract

from ..database import get_db
from ..models.user import User
from ..models.beneficiary import Beneficiary
from ..models.transaction import Transaction
from ..schemas.transaction_schema import (
    TransactionCreate,
    TransactionResponse,
    TransactionWithBeneficiary,
    TransactionList,
    TransactionFilter
)
from ..services.auth_service import get_current_active_user
from ..services.transaction_service import create_transaction_record
from ..utils.amount_to_words import amount_to_words

router = APIRouter()


@router.get("/", response_model=TransactionList)
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2030),
    beneficiary_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get transactions for current user with filters"""
    
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if month:
        query = query.filter(extract('month', Transaction.transaction_date) == month)
    
    if year:
        query = query.filter(extract('year', Transaction.transaction_date) == year)
    
    if beneficiary_id:
        query = query.filter(Transaction.beneficiary_id == beneficiary_id)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    transactions = query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()
    
    # Add beneficiary details to each transaction
    transactions_with_beneficiary = []
    for transaction in transactions:
        beneficiary = db.query(Beneficiary).filter(Beneficiary.id == transaction.beneficiary_id).first()
        transaction_dict = {
            **transaction.__dict__,
            "beneficiary": {
                "id": beneficiary.id,
                "name": beneficiary.name,
                "bank_name": beneficiary.bank_name
            } if beneficiary else None
        }
        transactions_with_beneficiary.append(transaction_dict)
    
    pages = (total + limit - 1) // limit
    
    return TransactionList(
        transactions=transactions_with_beneficiary,
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        pages=pages
    )


@router.get("/{transaction_id}", response_model=TransactionWithBeneficiary)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific transaction by ID"""
    
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Get beneficiary details
    beneficiary = db.query(Beneficiary).filter(Beneficiary.id == transaction.beneficiary_id).first()
    
    return {
        **transaction.__dict__,
        "beneficiary": {
            "id": beneficiary.id,
            "name": beneficiary.name,
            "bank_name": beneficiary.bank_name,
            "account_number": beneficiary.account_number,
            "ifsc_code": beneficiary.ifsc_code
        } if beneficiary else None
    }


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new transaction"""
    
    # Verify beneficiary exists and belongs to user
    beneficiary = db.query(Beneficiary).filter(
        Beneficiary.id == transaction.beneficiary_id,
        Beneficiary.user_id == current_user.id,
        Beneficiary.is_active == True
    ).first()
    
    if not beneficiary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    # Convert amount to words
    amount_in_words = amount_to_words(transaction.amount)
    
    # Create transaction record
    db_transaction = Transaction(
        user_id=current_user.id,
        beneficiary_id=transaction.beneficiary_id,
        amount=transaction.amount,
        amount_in_words=amount_in_words,
        cheque_number=transaction.cheque_number,
        transaction_date=transaction.transaction_date,
        purpose=transaction.purpose,
        remarks=transaction.remarks,
        transaction_reference=f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{current_user.id}"
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction


@router.get("/stats/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics"""
    
    # Total transactions
    total_transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
    
    # Total amount transferred
    total_amount = db.query(Transaction).filter(Transaction.user_id == current_user.id).with_entities(
        Transaction.amount
    ).all()
    total_amount_sum = sum([t.amount for t in total_amount]) if total_amount else 0
    
    # Transactions this month
    current_month = datetime.now().month
    current_year = datetime.now().year
    monthly_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        extract('month', Transaction.transaction_date) == current_month,
        extract('year', Transaction.transaction_date) == current_year
    ).count()
    
    # Active beneficiaries
    active_beneficiaries = db.query(Beneficiary).filter(
        Beneficiary.user_id == current_user.id,
        Beneficiary.is_active == True
    ).count()
    
    return {
        "total_transactions": total_transactions,
        "total_amount": total_amount_sum,
        "monthly_transactions": monthly_transactions,
        "active_beneficiaries": active_beneficiaries
    }


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    password: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete transaction with password verification"""
    
    # Verify password (using a simple password for now)
    # In production, this should be stored securely and configurable
    ADMIN_PASSWORD = "admin123"  # Change this to your desired password
    
    if password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Find transaction
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Delete transaction
    db.delete(transaction)
    db.commit()
    
    return {"message": "Transaction deleted successfully"}
