from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class RemitterBase(BaseModel):
    account_name: str = Field(..., min_length=2, max_length=100, description="Account holder's full name")
    account_number: str = Field(..., min_length=10, max_length=50, description="Bank account number")
    bank_name: str = Field(..., min_length=2, max_length=100, description="Name of the bank")
    branch_name: str = Field(..., min_length=2, max_length=100, description="Bank branch name")
    ifsc_code: str = Field(..., min_length=11, max_length=11, description="Bank IFSC code")
    swift_code: Optional[str] = Field(None, max_length=11, description="SWIFT code")
    pan_number: Optional[str] = Field(None, min_length=10, max_length=10, description="PAN number")
    address: Optional[str] = Field(None, max_length=500, description="Complete address")
    mobile: Optional[str] = Field(None, pattern=r'^[6-9]\d{9}$', description="Mobile number")
    email: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', description="Email address")

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

    @field_validator('pan_number')
    @classmethod
    def validate_pan(cls, v):
        if v and (len(v) != 10 or not v[:5].isalpha() or not v[5:9].isdigit() or not v[9].isalpha()):
            raise ValueError('PAN number must be in format: AAAAA9999A')
        return v.upper() if v else v


class RemitterCreate(RemitterBase):
    pass


class RemitterUpdate(BaseModel):
    account_name: Optional[str] = Field(None, min_length=2, max_length=100)
    account_number: Optional[str] = Field(None, min_length=10, max_length=50)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    branch_name: Optional[str] = Field(None, min_length=2, max_length=100)
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11)
    swift_code: Optional[str] = Field(None, max_length=11)
    pan_number: Optional[str] = Field(None, min_length=10, max_length=10)
    address: Optional[str] = Field(None, max_length=500)
    mobile: Optional[str] = Field(None, pattern=r'^[6-9]\d{9}$')
    email: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
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

    @field_validator('pan_number')
    @classmethod
    def validate_pan(cls, v):
        if v and (len(v) != 10 or not v[:5].isalpha() or not v[5:9].isdigit() or not v[9].isalpha()):
            raise ValueError('PAN number must be in format: AAAAA9999A')
        return v.upper() if v else v


class RemitterResponse(RemitterBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True