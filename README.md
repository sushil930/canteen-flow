# 🍽️ Canteen Flow - Smart Campus Food Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Project Status:** 🚧 In Development (Actively being developed and improved)

### Welcome to Canteen Flow!

Canteen Flow is a **modern, full-stack web application** designed to revolutionize food ordering within university campuses and similar institutional environments. It provides a seamless and intuitive experience for students to browse and order their favorite meals, while offering canteen staff a robust and efficient system for managing operations.

**Key Highlights:**
*   **Student-Friendly Ordering:** A smooth, interactive interface for browsing menus, customizing orders, and swift checkout.
*   **Efficient Canteen Management:** A dedicated admin dashboard for real-time order processing, menu updates, and operational insights.
*   **Guest Mode for Exploration:** Allows new visitors to experience the full frontend flow, including mock ordering and payment, without requiring registration or a live backend connection.
*   **Scalable Architecture:** Built with industry-standard technologies to ensure maintainability and future expandability.

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Overview](#-api-overview)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Roadmap](#-roadmap)

---

## 🚀 About the Project

Canteen Flow aims to solve common pain points in campus dining, such as long queues and inefficient order processing. By providing an online platform, it enhances the student experience through convenience and speed, and empowers canteen operators with better tools for management and service delivery. The project emphasizes a clean UI, intuitive UX, and a robust, scalable backend infrastructure.

---

## ✅ Features

### For Users (Students/Customers):
- 🔍 **Browse Canteens & Menus**: Easily discover available canteens on campus and explore their diverse menus. View detailed item descriptions, current prices, and appealing images.
- 🛒 **Intuitive Shopping Cart**: Add desired food items to your cart, adjust quantities, and review your order before checkout.
- 💳 **Seamless Order & Payment Flow**: Experience a smooth ordering process, including a simulated payment gateway for guests, leading to an order confirmation.
- 🕒 **Real-time Order Status & History**: Track the live status of your current orders (e.g., Pending, Preparing, Ready) and review your past order history.
- 🔒 **User Authentication**: Secure login and registration process to manage personal profiles and order history for returning users.
- **Guest Mode**: Explore the full application functionality without needing to register or log in, perfect for first-time visitors.

### For Canteen Staff (Admin Panel):
- 📊 **Comprehensive Dashboard**: Get a quick overview of daily operations, including new orders, revenue statistics, and popular menu items.
- 📦 **Efficient Order Management**: Accept, process, and update the status of incoming orders in real-time, ensuring timely preparation and pickup.
- 🍔 **Dynamic Menu Management**: Easily add new menu items, update existing ones (prices, descriptions, images), categorize dishes, and mark items as unavailable.
- 📋 **User & Role Management**: View and manage registered users, including assigning staff roles (if applicable).

---

## 🛠️ Technology Stack

Canteen Flow is built with a modern, scalable technology stack, ensuring high performance, maintainability, and a great developer experience:

### 🔹 Frontend (User Interface)
- **React (with Vite)**: A fast, component-based JavaScript library for building dynamic user interfaces, bundled efficiently with Vite for rapid development.
- **TypeScript**: Provides type safety, enhancing code quality and reducing runtime errors.
- **Shadcn UI (Radix UI + Tailwind CSS)**: A collection of beautifully designed, reusable UI components built on Radix UI primitives and styled with Tailwind CSS for rapid and consistent UI development.
- **React Router**: For declarative routing, handling navigation within the single-page application.
- **TanStack Query (React Query)**: Manages server state, caching, and synchronization, simplifying data fetching and improving application responsiveness.
- **React Context**: Used for global state management (e.g., authentication status, order cart).
- **Framer Motion**: A powerful library for creating smooth, production-ready animations and interactive elements.

### 🔹 Backend (API & Business Logic)
- **Django**: A high-level Python web framework that encourages rapid development and clean, pragmatic design, providing a robust foundation for the API.
- **Django REST Framework (DRF)**: A flexible toolkit for building Web APIs on top of Django, offering powerful serialization, authentication, and view handling.
- **Python**: The primary programming language for the backend, known for its readability and extensive ecosystem.
- **dj-rest-auth & django-allauth**: Handles secure user authentication, registration, password reset, and session management.
- **PostgreSQL**: A powerful, open-source relational database used for production data storage (managed via Supabase).
- **SQLite**: Used as the default database for local development, providing a lightweight and easy-to-set-up solution.
- **django-cors-headers**: Manages Cross-Origin Resource Sharing (CORS), ensuring secure communication between frontend and backend.

### 🔹 External Services & Dev Tools
- **Razorpay**: A popular payment gateway integrated for secure and efficient online transactions.
- **Supabase**: Provides a PostgreSQL database, authentication, and file storage capabilities, acting as a backend-as-a-service solution.
- **Vercel**: The platform used for deploying the frontend application, offering fast global CDN and continuous deployment.
- **Render**: A cloud platform used for deploying the Django backend, providing automatic deployments and scaling.
- **npm & pip**: Package managers for Node.js and Python, respectively, used to manage project dependencies.
- **Git**: For version control and collaborative development.

---

## 🚀 Getting Started

Follow these steps to set up and run Canteen Flow on your local machine.

### Prerequisites

Ensure you have the following installed:

-   **[Python 3.8+](https://www.python.org/downloads/)**: Required for the Django backend.
-   **[Node.js (LTS)](https://nodejs.org/en/download/)**: Includes npm, required for the React frontend.
-   **[Git](https://git-scm.com/downloads)**: For cloning the repository.

---

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sushil930/canteen-flow.git
    cd canteen-flow
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Create and activate a virtual environment:**
    It's highly recommended to use a virtual environment to manage dependencies.
    ```bash
    # Create the virtual environment
    python -m venv venv

    # Activate on Windows
    .\venv\Scripts\activate

    # Activate on macOS/Linux
    source venv/bin/activate
    ```

4.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Set up environment variables:**
    - Create a file named `.env` in the `backend/` directory (same level as `manage.py`).
    - Copy the contents from the [Backend Environment Variables](#backend-backendenv) section below into this file and fill in your actual credentials. For local development, you can use placeholder values for Razorpay keys initially if you don't need real payment processing.

6.  **Run database migrations and create a superuser:**
    This will set up your local SQLite database and create an admin user for the Django admin panel.
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    ```

---

### Frontend Setup

1.  **Navigate to the project root directory:**
    If you are currently in the `backend` directory, go back one level:
    ```bash
    cd ..
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a file named `.env.local` in the project root (same level as `package.json`).
    - Copy the contents from the [Frontend Environment Variables](#frontend-envlocal) section below and update the values. The `VITE_API_BASE_URL` should point to your running local backend (e.g., `http://127.0.0.1:8000/api`).

---

### ▶️ Running the Application

You will need two separate terminals to run both the backend and frontend servers simultaneously.

1.  **Start the Backend Server (in the `backend/` directory):**
    Ensure your Python virtual environment is activated.
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://127.0.0.1:8000/api/`.
    The Django Admin panel will be at `http://127.0.0.1:8000/admin/`.

2.  **Start the Frontend Server (in the project root directory):**
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:8080` (or another port if 8080 is busy).

---

## 🔐 Environment Variables

Environment variables are crucial for configuring sensitive information and deployment-specific settings. **Never commit your `.env` or `.env.local` files to Git!** They should only be present in your local development environment or production server.

### Backend (`backend/.env`)
```env
SECRET_KEY=your_django_secret_key_here
DEBUG=True

# Database Credentials (for local PostgreSQL or production Supabase)
# For local development with SQLite, these are not strictly necessary unless you switch DB
DB_NAME=canteenflow_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Razorpay API Keys (obtained from your Razorpay dashboard)
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Allowed Hosts (for Django security, include all domains that can access your backend)
ALLOWED_HOSTS='127.0.0.1,localhost,canteen-backend-17px.onrender.com'

# CORS (Cross-Origin Resource Sharing) configuration
CORS_ORIGIN_WHITELIST=http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173,https://canteen-flow.vercel.app
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOW_CREDENTIALS=True
```

### Frontend (`.env.local`)
```env
# Base URL for your backend API (update this for production deployments)
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Your public Razorpay Key ID for the frontend (used to initialize Razorpay checkout)
VITE_RAZORPAY_KEY_ID=rzp_test_yourkeyid
```

> **Important Security Note:**
> - For production deployments, always set `DEBUG=False` in your backend `.env`.
> - Update `DB_*` variables in production to point to your live PostgreSQL database (e.g., Supabase credentials).
> - Ensure `SECRET_KEY` is a long, random, and unique string for production.
> - `CORS_ORIGIN_WHITELIST` should precisely list only the domains your frontend will be deployed on.

---

## 🚢 Deployment

Canteen Flow is designed for independent deployment of its frontend and backend components.

-   **Database**: PostgreSQL is used in production, with [Supabase](https://supabase.com/) being the recommended hosting provider for its ease of setup and integration.

-   **Backend (Django REST Framework)**:
    -   **Platforms**: Deploy to cloud platforms like [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/).
    -   **Web Server**: Use a production-grade WSGI server like [Gunicorn](https://gunicorn.org/) or [uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/).
    -   **Environment**: Crucially, set `DEBUG=False` and configure all production environment variables (e.g., `SECRET_KEY`, `DB_*` credentials, `ALLOWED_HOSTS`, `CORS_ORIGIN_WHITELIST`) on your chosen platform.

-   **Frontend (React/Vite)**:
    -   **Platform**: Deployed on **Vercel** for its excellent performance and developer experience with React applications. You can access the live frontend application here: [https://canteen-flow.vercel.app/](https://canteen-flow.vercel.app/)
    -   **Build Process**: Run `npm run build` to create a production-ready build of your frontend in the `dist/` directory.
    -   **Configuration**: Ensure that the `VITE_API_BASE_URL` environment variable on your frontend hosting platform points to the live URL of your deployed backend API.

---

## 🚨 Troubleshooting

Here are some common issues and their solutions when setting up or running the Canteen Flow project:

-   **`400 Bad Request` or `DisallowedHost` Error:**
    -   **Cause**: Django's `ALLOWED_HOSTS` setting does not include the domain/IP from which you are accessing the backend.
    -   **Solution**: In `backend/canteen_project/settings.py`, ensure `ALLOWED_HOSTS` includes `'127.0.0.1'`, `'localhost'`, and your deployed backend's domain (e.g., `'canteen-backend-17px.onrender.com'`).

-   **CORS (Cross-Origin Resource Sharing) Errors (`blocked by CORS policy`)**: 
    -   **Cause**: Your frontend (running on one origin, e.g., `http://localhost:8080`) is trying to access your backend (running on another origin, e.g., `http://127.0.0.1:8000`), and the backend is not configured to allow requests from the frontend's origin.
    -   **Solution**: In `backend/canteen_project/settings.py`, verify that `CORS_ORIGIN_WHITELIST` contains the exact URLs of your frontend development server (`http://localhost:8080`, `http://127.0.0.1:5173`) and your deployed frontend (e.g., `https://canteen-flow.vercel.app`). Also ensure `CORS_ALLOW_CREDENTIALS` is `True` and `CORS_ALLOW_HEADERS` includes necessary headers like `Content-Type` and `Authorization`.

-   **`TypeError: Failed to fetch` (Frontend Console Error)**:
    -   **Cause**: The frontend failed to connect to the backend API. This could be due to the backend server not running, an incorrect `VITE_API_BASE_URL` in your frontend's `.env.local` (or production environment variables), or a persistent CORS issue.
    -   **Solution**: 
        1.  Ensure your backend server is running (`python manage.py runserver`).
        2.  Double-check `VITE_API_BASE_URL` in your `.env.local` (e.g., `http://127.0.0.1:8000/api`).
        3.  Review CORS settings as described above.

-   **Missing Environment Variables**: 
    -   **Cause**: The application cannot find required environment variables (e.g., `SECRET_KEY`, `RAZORPAY_KEY_ID`).
    -   **Solution**: Ensure you have created the `.env` (backend) and `.env.local` (frontend) files and populated them with all required variables as detailed in the [Environment Variables](#-environment-variables) section.

-   **`ModuleNotFoundError` (Python Backend)**: 
    -   **Cause**: A Python package listed in `requirements.txt` is not installed or your virtual environment is not activated.
    -   **Solution**: Activate your virtual environment (`source venv/bin/activate` or `.\venv\Scripts\activate`) and run `pip install -r requirements.txt` again.

-   **Ports Already In Use**: 
    -   **Cause**: Another process is already using port `8000` (backend) or `8080` (frontend).
    -   **Solution**: You can specify different ports when starting the servers:
        -   Backend: `python manage.py runserver 8001`
        -   Frontend: `npm run dev -- --port 3001`
        Remember to update `VITE_API_BASE_URL` in your frontend `.env.local` if you change the backend port.

---

## 🔗 API Overview

Canteen Flow provides a comprehensive RESTful API for all its functionalities. While a dedicated API documentation (e.g., Swagger/OpenAPI) is planned, you can explore the available endpoints through Django REST Framework's browsable API.

Once your backend server is running locally, access the main API root at:
[http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

From there, you can navigate through the different endpoints for users, canteens, menu items, orders, and payments.

---

## 🗺️ Roadmap

Canteen Flow is under active development, and we have several exciting features planned to enhance its functionality and user experience:

-   **Admin Panel Enhancements**: 
    -   Comprehensive analytics and reporting for canteen managers.
    -   Advanced order filtering and search capabilities.
    -   Better user management features (e.g., assigning roles).
-   **User Features**:
    -   User profiles with customizable preferences.
    -   Favorite items and reorder functionality.
    -   Notifications for order status updates.
-   **Payment Gateway Integrations**: Explore additional payment options beyond Razorpay.
-   **Performance Optimization**: Continuous efforts to improve application speed and responsiveness for both frontend and backend.
-   **API Documentation**: Implement Swagger/OpenAPI for clear and interactive API documentation.
-   **Comprehensive Testing**: Expand unit, integration, and end-to-end tests across the application.
-   **Refinement of Guest Mode**: Further streamline the guest experience, potentially allowing guest users to save a temporary cart.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request if you find bugs, have feature ideas, or want to improve the codebase.

To contribute:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and ensure tests pass (if applicable).
4.  Commit your changes (`git commit -m "feat: Add new feature"`).
5.  Push to your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request to the `main` branch of this repository.

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
