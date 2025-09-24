import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.beneficiary import Beneficiary
from ..models.remitter import Remitter
from ..services.auth_service import get_current_active_user
from ..services.pdf_generator import generate_rtgs_pdf, download_pdf
from ..config import settings

router = APIRouter()


@router.post("/generate/{transaction_id}")
async def generate_pdf(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate RTGS PDF for a transaction"""
    
    # Get transaction with beneficiary
    transaction = db.query(Transaction).options(
        joinedload(Transaction.beneficiary)
    ).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    try:
        # Generate PDF using updated function
        pdf_buffer = generate_rtgs_pdf(transaction, current_user, db)
        
        # Create filename for download
        beneficiary_name = transaction.beneficiary.name.replace(' ', '_') if transaction.beneficiary.name else 'Unknown'
        filename = f"RTGS_{beneficiary_name}_{transaction.transaction_date.strftime('%Y%m%d')}.pdf"
        
        # Return PDF as streaming response
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )


@router.get("/download/{transaction_id}")
async def download_pdf_route(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download RTGS PDF for a transaction"""
    
    try:
        # Use the download_pdf function from pdf_generator
        pdf_buffer = await download_pdf(transaction_id, current_user, db)
        
        if not pdf_buffer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Get transaction for filename
        transaction = db.query(Transaction).options(
            joinedload(Transaction.beneficiary)
        ).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        ).first()
        
        beneficiary_name = transaction.beneficiary.name.replace(' ', '_') if transaction.beneficiary and transaction.beneficiary.name else 'Unknown'
        filename = f"RTGS_{beneficiary_name}_{transaction.transaction_date.strftime('%Y%m%d')}.pdf"
        
        # Return PDF as streaming response
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download PDF: {str(e)}"
        )
