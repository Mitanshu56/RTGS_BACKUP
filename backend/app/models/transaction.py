from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("beneficiaries.id"), nullable=False)
    
    # Transaction details
    amount = Column(Float, nullable=False)
    amount_in_words = Column(Text, nullable=False)
    cheque_number = Column(String(50))
    transaction_date = Column(DateTime, nullable=False)
    transaction_reference = Column(String(100))
    
    # Additional fields
    purpose = Column(String(200))
    remarks = Column(Text)
    pdf_path = Column(String(500))  # Path to generated PDF
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    beneficiary = relationship("Beneficiary", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, amount={self.amount}, date='{self.transaction_date}')>"
