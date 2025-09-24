from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Remitter(Base):
    __tablename__ = "remitters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    account_name = Column(String(100), nullable=False)
    account_number = Column(String(50), nullable=False)
    bank_name = Column(String(100), nullable=False)
    branch_name = Column(String(100), nullable=False)
    ifsc_code = Column(String(11), nullable=False)
    swift_code = Column(String(11), nullable=True)
    pan_number = Column(String(10), nullable=True)
    address = Column(String(500), nullable=True)
    mobile = Column(String(10), nullable=True)
    email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="remitter")

    def __repr__(self):
        return f"<Remitter(id={self.id}, account_name='{self.account_name}', account='{self.account_number}')>"
