from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from decimal import Decimal

from app.database.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import CategoryTotal
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/category-distribution", response_model=List[CategoryTotal])
def category_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    grand_total = sum(r.total for r in rows) or Decimal("1")

    return [
        CategoryTotal(
            category=r.category,
            total=r.total,
            percentage=round(float(r.total / grand_total) * 100, 2),
        )
        for r in rows
    ]


@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime

    now = datetime.utcnow()

    total = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.user_id == current_user.id)
        .scalar()
        or 0
    )

    monthly = (
        db.query(func.sum(Expense.amount))
        .filter(
            Expense.user_id == current_user.id,
            extract("year", Expense.created_at) == now.year,
            extract("month", Expense.created_at) == now.month,
        )
        .scalar()
        or 0
    )

    top_cat = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .first()
    )

    recent = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_expenses": float(total),
        "monthly_expenses": float(monthly),
        "highest_category": top_cat.category if top_cat else None,
        "highest_category_amount": float(top_cat.total) if top_cat else 0,
        "recent_expenses": [
            {
                "id": e.id,
                "category": e.category,
                "amount": float(e.amount),
                "comments": e.comments,
                "created_at": e.created_at.isoformat(),
            }
            for e in recent
        ],
    }


@router.get("/monthly-trend")
def monthly_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            extract("month", Expense.created_at).label("month"),
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(extract("month", Expense.created_at))
        .order_by(extract("month", Expense.created_at))
        .all()
    )

    month_names = [
        "",
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ]

    return [
        {
            "month": month_names[int(r.month)],
            "total": float(r.total)
        }
        for r in rows
    ]