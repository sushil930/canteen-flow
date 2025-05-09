# 🍽️ Canteen Flow - Smart Campus Food Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Project Status:** 🚧 In Development

Canteen Flow is a full-stack web application that simplifies food ordering in a campus environment. Students can easily browse menus, place orders, and track them — while canteen staff manage everything through a powerful admin dashboard.

---

## 📑 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✅ Features

### User Side:
- 🔍 **Browse Canteens**: Explore available food vendors on campus.
- 📋 **Menu Viewing**: See item descriptions, prices, and images.
- 🛒 **Order Management**: Add items to cart and place orders seamlessly.
- 🕒 **Order History**: Track current and past orders.
- 👤 **User Profiles** *(coming soon)*: Manage account details.

### Admin Side:
- 📊 **Dashboard**: View orders, users, and menus at a glance.
- 🧾 **Menu Management**: Add/edit/delete items and control availability.
- 📦 **Order Processing**: Update order statuses: Preparing, Ready, Delivered.
- 🏪 **Canteen Management** *(optional)*: Edit canteen info and availability.

---

## 🛠️ Technology Stack

### 🔹 Frontend
- **Framework**: React (Vite)
- **UI Library**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router
- **Data Fetching**: TanStack Query (React Query)
- **Animation**: Framer Motion, ldrs
- **Language**: TypeScript

### 🔹 Backend
- **Framework**: Django + Django REST Framework
- **Authentication**: `dj-rest-auth` + `django-allauth`
- **ORM**: Django ORM
- **CORS Handling**: `django-cors-headers`
- **Language**: Python

### 🔹 External Services
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Payments**: Razorpay

### 🔹 Dev Tools
- **Package Managers**: npm, pip
- **Version Control**: Git

---

## 🧱 Architecture

Canteen Flow follows a decoupled client-server architecture:

- **Frontend**: SPA built with React + Vite. Handles UI and API calls.
- **Backend**: RESTful API with Django/DRF. Handles logic, DB ops, and authentication.
- **Database**: Supabase PostgreSQL instance.
- **File Storage**: Images and media stored via Supabase Storage.
- **API Format**: RESTful, JSON-based communication.

---

## 📁 File Structure

```bash
canteen-flow/
├── backend/         # Django + DRF Backend
│   ├── manage.py
│   ├── ...
├── frontend/        # React + Vite Frontend
│   ├── src/
│   ├── ...
├── README.md
├── .gitignore
└── ...
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Python 3.8+](https://www.python.org/)
- [Node.js (LTS)](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/sushil930/canteen-flow.git
cd canteen-flow
```

#### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Activate virtual env:
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
# Create `.env` in this directory (see Environment Variables section)
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install   # or yarn / bun install

# Setup environment
cp .env.example .env
# Update values in `.env` (see Environment Variables section)
```

---

### ▶️ Running the Application

Start backend server:

```bash
cd backend
source venv/bin/activate  # if not already activated
python manage.py runserver
```

Start frontend server:

```bash
cd frontend
npm run dev  # or yarn/bun equivalent
```

Access the app:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- Django Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### 🛠️ Troubleshooting

- **Ports Busy**? Try different ones using:  
  `python manage.py runserver 8001`, `npm run dev -- --port 3001`
- **CORS Issues**? Verify `CORS_ALLOWED_ORIGINS` in `settings.py` and `VITE_API_BASE_URL` in `.env`.
- **Database Issues**? Rerun migrations or reset local DB (for development only).
- **Dependency Errors**? Ensure correct versions are installed via `pip` and `npm`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your_secret_key
DEBUG=True

# Supabase DB
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=db.yourproject.supabase.co
DB_PORT=5432

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Optional:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_service_key
# SUPABASE_BUCKET=media

# CORS & Host Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env` or `.env.local`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Optional:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key
```

> ⚠️ Never expose secrets like `SUPABASE_KEY` in frontend `.env`.

---

## 🔗 API Overview

> 📌 *Coming soon: Detailed endpoint documentation with Swagger/OpenAPI.*

---

## 🚢 Deployment

- **Database/Auth**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Backend (Django)**:
  - Deploy via Render, Railway, or Heroku
  - Use Gunicorn for production
  - Set `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
- **Frontend (React/Vite)**:
  - Build: `npm run build`
  - Deploy `dist/` to Vercel, Netlify, or GitHub Pages
  - Ensure `VITE_API_BASE_URL` points to live backend

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repo
2. Create a new branch (`git checkout -b feature-x`)
3. Make changes
4. Submit a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

> 💡 Built with love to make campus dining smoother, faster, and smarter!
