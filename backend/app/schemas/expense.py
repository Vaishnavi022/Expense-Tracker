from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class ExpenseCreate(BaseModel):
    category: str
    amount: Decimal
    comments: Optional[str] = None

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Category cannot be empty")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    comments: Optional[str] = None

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Category cannot be empty")
        return v.strip() if v else v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class ExpenseOut(BaseModel):
    id: int
    user_id: int
    category: str
    amount: Decimal
    comments: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    data: List[ExpenseOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class CategoryTotal(BaseModel):
    category: str
    total: Decimal
    percentage: float

