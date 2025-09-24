from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    account_number = Column(String(50), nullable=False)
    bank_name = Column(String(100), nullable=False)
    branch_name = Column(String(100), nullable=False)
    ifsc_code = Column(String(11), nullable=False)
    bank_address = Column(String(500))  # New field for bank address
    mobile = Column(String(10))
    email = Column(String(255))
    address = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="beneficiaries")
    transactions = relationship("Transaction", back_populates="beneficiary")

    def __repr__(self):
        return f"<Beneficiary(id={self.id}, name='{self.name}', account='{self.account_number}')>"
