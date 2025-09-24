from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class TransactionBase(BaseModel):
    beneficiary_id: int
    amount: float = Field(..., gt=0, le=99999999.99)
    cheque_number: Optional[str] = Field(None, max_length=50)
    transaction_date: datetime
    purpose: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = Field(None, max_length=1000)

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v > 99999999.99:
            raise ValueError('Amount cannot exceed 9,99,99,999.99')
        return round(v, 2)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    beneficiary_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0, le=99999999.99)
    cheque_number: Optional[str] = Field(None, max_length=50)
    transaction_date: Optional[datetime] = None
    purpose: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = Field(None, max_length=1000)

    @validator('amount')
    def validate_amount(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Amount must be greater than 0')
            if v > 99999999.99:
                raise ValueError('Amount cannot exceed 9,99,99,999.99')
            return round(v, 2)
        return v


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    amount_in_words: str
    transaction_reference: Optional[str] = None
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionWithBeneficiary(TransactionResponse):
    beneficiary: Optional[dict] = None


class TransactionFilter(BaseModel):
    month: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=2020, le=2030)
    beneficiary_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)


class TransactionList(BaseModel):
    transactions: List[TransactionWithBeneficiary]
    total: int
    page: int
    size: int
    pages: int
