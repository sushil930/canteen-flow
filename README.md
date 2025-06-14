# 🍽️ Canteen Flow - Smart Campus Food Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Project Status:** 🚧 In Development

Canteen Flow is a full-stack web application designed to streamline the food ordering process in a campus environment. It allows students to browse menus from various canteens, place orders, and make payments online, while providing canteen staff with a powerful dashboard to manage orders and menu items.

This project features a decoupled architecture with a Django REST backend and a React (Vite) frontend. It also includes a **Guest Mode** to allow for full exploration of the frontend without requiring a backend connection or user authentication.

---

## 📑 Table of Contents

- [Features](#-features)
- [Technology-Stack](#-technology-stack)
- [Getting-Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend-Setup](#backend-setup)
  - [Frontend-Setup](#frontend-setup)
  - [Running-the-Application](#-running-the-application)
- [Environment-Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✅ Features

### User Side:
- 🔍 **Browse Canteens & Menus**: Explore available canteens and view their menus with item descriptions, prices, and images.
- 🛒 **Shopping Cart**: Add and manage items in a persistent cart.
- 💳 **Guest Checkout**: A fully simulated payment and order status flow for guest users.
- 👤 **Authentication**: Standard login/registration flow for real users.
- 🕒 **Order History & Status**: Track the status of current and past orders.

### Admin Side:
- 📊 **Dashboard**: An overview of orders, revenue, and popular items.
- 📦 **Order Management**: View incoming orders and update their status (e.g., Preparing, Ready).
- 🍔 **Menu Management**: Add, edit, or delete canteens, categories, and menu items.

---

## 🛠️ Technology Stack

### 🔹 Frontend
- **Framework**: React (with Vite)
- **Language**: TypeScript
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **Routing**: React Router
- **State Management**: TanStack Query (React Query) & React Context
- **Animations**: Framer Motion

### 🔹 Backend
- **Framework**: Django & Django REST Framework
- **Language**: Python
- **Authentication**: `dj-rest-auth` & `django-allauth`
- **Database**: PostgreSQL (local) / Supabase (production)
- **CORS**: `django-cors-headers`

### 🔹 External Services & Dev Tools
- **Payments**: Razorpay
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Package Managers**: npm, pip
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- [Python (3.8+)]()
- [Node.js (LTS)]()
- [Git]()

---

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Create the virtual environment
    python -m venv venv

    # Activate on Windows
    .\venv\Scripts\activate

    # Activate on macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    - Create a file named `.env` inside the `backend/` directory.
    - Copy the contents from the [Backend Environment Variables](#backend-backendenv) section below into this file and fill in your credentials.

5.  **Run database migrations and create a superuser:**
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    ```

---

### Frontend Setup

1.  **Navigate to the project root directory** (if you are in the `backend` directory, go back one level).
    ```bash
    cd ..
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a file named `.env.local` in the project root.
    - Copy the contents from the [Frontend Environment Variables](#frontend-envlocal) section below and update the values if needed.

---

### ▶️ Running the Application

You will need two separate terminals to run both the backend and frontend servers simultaneously.

1.  **Start the Backend Server (from the `backend/` directory):**
    ```bash
    # Make sure your virtual environment is activated
    python manage.py runserver
    ```
    The backend will be available at `http://127.0.0.1:8000`.

2.  **Start the Frontend Server (from the project root directory):**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:8080`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your_django_secret_key_here
DEBUG=True

# Database Credentials (example for local development)
DB_NAME=canteenflow
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Razorpay API Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (`.env.local`)
```env
# URL of your backend API
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Your public Razorpay Key ID for the frontend
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> **Note:** For production, `DEBUG` should be `False` and you should update the `DB_*` variables to point to your production database (e.g., Supabase).

---

## 🚢 Deployment

- **Database**: Supabase (PostgreSQL) is recommended for production.
- **Backend (Django)**:
  - Deploy to a platform like Render or Heroku.
  - Use a production-grade web server like Gunicorn.
  - Ensure production environment variables are set correctly (`DEBUG=False`, `SECRET_KEY`, database credentials).
- **Frontend (React/Vite)**:
  - Deployed on **Vercel**.
  - The `VITE_API_BASE_URL` must be updated to point to the live backend URL.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request.

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
