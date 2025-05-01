# Canteen Flow - Smart Campus Food Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other relevant badges here: e.g., Build Status, Coverage, Framework versions -->
<!-- [![Build Status](link/to/build/badge)](link/to/build/pipeline) -->
<!-- [![Coverage Status](link/to/coverage/badge)](link/to/coverage/report) -->

**Project Status:** <!-- e.g., In Development / Beta / Stable -->

Canteen Flow is a modern, full-stack web application designed to streamline the food ordering process within a campus environment. It provides an intuitive interface for users to browse menus, place orders, and manage their dining experience, along with a robust admin panel for canteen staff to manage offerings and orders.

<!-- Add a compelling screenshot or GIF here -->
<!-- ![Canteen Flow Screenshot](link/to/your/screenshot.png) -->

## Table of Contents

*   [Features](#features)
*   [Technology Stack](#technology-stack)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Running the Application](#running-the-application)
    *   [Troubleshooting](#troubleshooting)
*   [Environment Variables](#environment-variables)
*   [API Overview](#api-overview-key-endpoints)
*   [Deployment](#deployment)
*   [Contributing](#contributing)
*   [License](#license)

## Features

**User Features:**
*   Canteen Selection: Browse available canteens on campus.
*   Menu Browsing: View detailed menus with item descriptions, prices, and images.
*   Order Placement: Add items to a cart and place orders easily.
*   Order History: View past orders and their statuses.
*   User Profiles: Manage personal information (potentially).

**Admin Features:**
*   Admin Dashboard: Overview of orders, menu items, and potentially users.
*   Menu Management: Add, edit, delete menu items, categories, and manage availability.
*   Order Management: View incoming orders, update order statuses (e.g., Preparing, Ready, Delivered).
*   Canteen Management: (If applicable) Manage canteen details.

## Technology Stack

*   **Frontend:**
    *   Framework: React (with Vite)
    *   UI Library: Shadcn/ui (based on Radix UI & Tailwind CSS)
    *   Routing: React Router
    *   State Management/Data Fetching: TanStack Query (React Query)
    *   Styling: Tailwind CSS
    *   Language: TypeScript
*   **Backend:**
    *   Framework: Django, Django REST Framework (DRF)
    *   Database: SQLite (default for development), PostgreSQL (recommended for production)
    *   Authentication: Django's built-in auth / DRF Token Authentication (or JWT)
    *   API Testing: (Potentially Django Test Client or tools like Postman)
    *   Language: Python
*   **Development Tools:**
    *   Package Managers: npm (or bun/yarn), pip
    *   Version Control: Git

## Architecture

This project follows a standard client-server architecture:

*   **Frontend (Client):** A single-page application (SPA) built with React and TypeScript. It handles the user interface, user interactions, and communicates with the backend via a REST API. Vite serves the frontend during development and builds it for production.
*   **Backend (Server):** A RESTful API built with Django and Django REST Framework (DRF). It manages business logic, data persistence (database interactions), user authentication, and serves data to the frontend.
*   **Database:** SQLite is used for development simplicity, while PostgreSQL is recommended for production environments.
*   **API Communication:** The frontend and backend communicate using REST principles, typically exchanging data in JSON format.

## File Structure

Here's a high-level overview of the project structure:

canteen-order-flow/
├── backend/                  # Django Backend Application
│   ├── api/                  # DRF API application (serializers, views, urls)
│   ├── canteen_backend/      # Django project settings, main urls.py, wsgi.py
│   ├── media/                # User-uploaded files (e.g., menu item images)
│   ├── venv/                 # Python virtual environment (if created here)
│   ├── db.sqlite3            # Development database
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Backend Python dependencies
│
├── frontend/                 # React Frontend Application (Vite)
│   ├── public/               # Static assets served directly
│   ├── src/                  # Main frontend source code
│   │   ├── assets/           # Static assets (images, fonts) processed by Vite
│   │   ├── components/       # Reusable UI components (e.g., Header, Button)
│   │   ├── context/          # React Context API providers (e.g., OrderContext, AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions, API client setup
│   │   ├── pages/            # Page-level components (routed views)
│   │   ├── styles/           # Global styles (if any beyond Tailwind)
│   │   ├── App.tsx           # Main application component, router setup
│   │   └── main.tsx          # Application entry point
│   ├── index.html            # Main HTML template
│   ├── package.json          # Frontend dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite configuration
│
├── .gitignore                # Specifies intentionally untracked files
└── README.md                 # This file

### Prerequisites

*   [Python](https://www.python.org/) (3.8+ recommended)
*   [Node.js](https://nodejs.org/) (LTS version recommended) and npm (or bun/yarn)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd canteen-order-flow
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate

    # Install dependencies (Ensure requirements.txt exists)
    pip install -r requirements.txt

    # Apply database migrations
    python manage.py makemigrations
    python manage.py migrate

    # Create a superuser (for admin access)
    python manage.py createsuperuser

    # Setup environment variables (See Environment Variables section)
    # If .env.example exists in backend/, copy it:
    # cp .env.example .env
    # Then fill in necessary backend environment variables in .env
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend # Navigate to frontend from project root
    # Install dependencies (choose one)
    npm install
    # OR
    # bun install
    # OR
    # yarn install

    # Setup environment variables (See Environment Variables section)
    # If .env.example exists in frontend/, copy it:
    # cp .env.example .env
    # Then fill in necessary frontend environment variables (e.g., VITE_BACKEND_URL) in .env
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    # Ensure you are in the backend directory with venv activated
    python manage.py runserver
    # (Usually runs on http://127.0.0.1:8000/)
    ```

2.  **Start the Frontend Development Server:**
    ```bash
    # Ensure you are in the frontend directory
    npm run dev
    # OR
    # bun run dev
    # OR
    # yarn dev
    # (Usually runs on http://localhost:5173 or similar)
    ```

3.  **Access the Application:**
    *   Frontend: `http://localhost:5173` (or the port specified by Vite)
    *   Backend API: `http://127.0.0.1:8000/api/`
    *   Django Admin: `http://127.0.0.1:8000/admin/`

### Troubleshooting

*   **Port Conflicts:** If port `8000` or `5173` is in use, check the terminal output for the actual port used or configure them differently (e.g., `python manage.py runserver 8001`, `npm run dev -- --port 3000`).
*   **CORS Errors:** Ensure `django-cors-headers` is configured correctly in the backend `settings.py` (check `CORS_ALLOWED_ORIGINS` or `CORS_ALLOW_ALL_ORIGINS = True` for development) and that the `VITE_BACKEND_URL` in the frontend `.env` file matches the backend address (e.g., `http://127.0.0.1:8000`).
*   **Database Issues:** Ensure migrations are applied (`python manage.py migrate`). For persistent issues during development, you might try deleting the `db.sqlite3` file in the `backend` directory and re-running migrations. **Do not do this in production.**
*   **Dependency Errors:** Ensure `pip install -r requirements.txt` and `npm install` (or equivalent) completed successfully in their respective directories.

## Environment Variables

This project relies on environment variables for configuration.

*   Look for `.env.example` files in both the `frontend` and `backend` directories.
*   **If they exist**, copy them to `.env` in their respective directories:
    ```bash
    # In backend directory:
    # cp .env.example .env
    # In frontend directory:
    # cp .env.example .env
    ```
*   Fill in the required values in your `.env` files (e.g., Django `SECRET_KEY`, `DATABASE_URL` if not using SQLite, frontend `VITE_BACKEND_URL`).
*   `.env` files are listed in `.gitignore` and should **not** be committed to version control.

## API Overview (Key Endpoints)

*   `/api/canteens/`: List available canteens.
*   `/api/categories/`: List menu categories (potentially filterable by canteen).
*   `/api/menu-items/`: List menu items (potentially filterable by canteen/category).
*   `/api/orders/`: Create orders, view user's order history.
*   `/api/token/`: Obtain authentication token (if using TokenAuthentication).
*   `/api/token/refresh/`: Refresh authentication token.
*   `/admin/`: Django admin interface.
*   `/api/admin/menu-items/`: CRUD operations for menu items (Admin only).
*   `/api/admin/categories/`: CRUD operations for categories (Admin only).
*   `/api/admin/orders/`: View and manage all orders (Admin only).

*(Note: Verify these endpoints against your actual `urls.py` configuration)*

## Deployment

<!-- Add instructions or link to documentation on how to deploy -->
Instructions for deploying the application to a production environment (e.g., using Docker, Heroku, Vercel, AWS, PythonAnywhere) will be added here.

*   **Backend:** Typically involves using a production-grade WSGI server (like Gunicorn or uWSGI), a reverse proxy (like Nginx), configuring a production database (like PostgreSQL), managing static files, and setting environment variables securely.
*   **Frontend:** Requires building the React app (`npm run build`) and serving the resulting static files (often via the same reverse proxy as the backend or a dedicated CDN/hosting service).

## Contributing

Contributions are welcome! Please follow standard Git workflow:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding style and includes tests where appropriate.

## License

This project is licensed under the MIT License - see the `LICENSE` file (if one exists) for details. If no `LICENSE` file is present, you should add one, typically containing the standard MIT License text.
