# Expense Tracker

A full-stack Expense Tracker web application built using Angular, FastAPI, SQLAlchemy, and JWT Authentication. The application enables users to securely manage their expenses, monitor spending patterns, and analyze financial data through an interactive dashboard.

---

## 📌 Features

### 🔐 User Authentication

* User Registration
* User Login
* JWT-based Authentication
* Secure Password Hashing
* Protected Routes

### 💰 Expense Management

* Add Expenses
* Edit Expenses
* Delete Expenses
* View Expense History
* Categorize Expenses

### 📊 Analytics Dashboard

* Total Expense Overview
* Monthly Expense Tracking
* Category-wise Expense Distribution
* Expense Statistics

### 📱 Responsive User Interface

* Modern Angular Material Design
* Mobile-Friendly Layout
* Interactive Dashboard

---

## 🛠️ Tech Stack

### Frontend

* Angular
* TypeScript
* Angular Material
* RxJS
* Chart.js

### Backend

* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Passlib

### Database

* SQLite

### Deployment

* Vercel
* Render

---

## 📂 Project Structure

```text
Expense-Tracker/
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── database/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── runtime.txt
│
└── README.md
```

---

## ⚙️ Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## ⚙️ Frontend Setup

```bash
cd frontend

npm install

ng serve
```

---

## 🔐 Authentication Flow

1. User registers with email and password.
2. Password is securely hashed before storage.
3. User logs in.
4. Backend generates a JWT access token.
5. Angular stores the token securely.
6. Protected API endpoints validate the JWT before granting access.

---

## 📊 API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/me       |

### Expenses

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | /api/expenses      |
| POST   | /api/expenses      |
| PUT    | /api/expenses/{id} |
| DELETE | /api/expenses/{id} |

### Analytics

| Method | Endpoint                             |
| ------ | ------------------------------------ |
| GET    | /api/analytics/category-distribution |
| GET    | /api/analytics/monthly-trend         |

---

## 🎯 Learning Outcomes

* Full Stack Development
* REST API Design
* JWT Authentication
* Angular Routing & Guards
* State Management
* Database Integration
* Deployment and Hosting
* Git & GitHub Workflow

---

## 📜 License

This project is developed for educational, portfolio, and interview demonstration purposes.
