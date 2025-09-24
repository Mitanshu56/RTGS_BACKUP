from sqlalchemy.orm import Session
from ..models.transaction import Transaction
from ..models.beneficiary import Beneficiary
from ..utils.amount_to_words import amount_to_words


def create_transaction_record(
    db: Session,
    user_id: int,
    beneficiary_id: int,
    amount: float,
    cheque_number: str = None,
    transaction_date = None,
    purpose: str = None,
    remarks: str = None
) -> Transaction:
    """Create a new transaction record"""
    
    # Convert amount to words
    amount_in_words = amount_to_words(amount)
    
    # Create transaction
    transaction = Transaction(
        user_id=user_id,
        beneficiary_id=beneficiary_id,
        amount=amount,
        amount_in_words=amount_in_words,
        cheque_number=cheque_number,
        transaction_date=transaction_date,
        purpose=purpose,
        remarks=remarks
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction
