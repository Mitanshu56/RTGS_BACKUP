from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class BeneficiaryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    account_number: str = Field(..., min_length=10, max_length=50)
    bank_name: str = Field(..., min_length=2, max_length=100)
    branch_name: str = Field(..., min_length=2, max_length=100)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    bank_address: Optional[str] = Field(None, max_length=500)
    mobile: Optional[str] = Field(None, pattern=r'^[6-9]\d{9}$')
    email: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    address: Optional[str] = Field(None, max_length=500)

    @field_validator('ifsc_code')
    @classmethod
    def validate_ifsc(cls, v):
        if not v.isalnum():
            raise ValueError('IFSC code must be alphanumeric')
        return v.upper()

    @field_validator('account_number')
    @classmethod
    def validate_account_number(cls, v):
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v


class BeneficiaryCreate(BeneficiaryBase):
    pass


class BeneficiaryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    account_number: Optional[str] = Field(None, min_length=10, max_length=50)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    branch_name: Optional[str] = Field(None, min_length=2, max_length=100)
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11)
    bank_address: Optional[str] = Field(None, max_length=500)
    mobile: Optional[str] = Field(None, pattern=r'^[6-9]\d{9}$')
    email: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    address: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

    @field_validator('ifsc_code')
    @classmethod
    def validate_ifsc(cls, v):
        if v and not v.isalnum():
            raise ValueError('IFSC code must be alphanumeric')
        return v.upper() if v else v

    @field_validator('account_number')
    @classmethod
    def validate_account_number(cls, v):
        if v and not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v


class BeneficiaryResponse(BeneficiaryBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
