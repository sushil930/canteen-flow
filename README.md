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
    *   Animation: Framer Motion, ldrs
    *   Styling: Tailwind CSS
    *   Language: TypeScript
*   **Backend:**
    *   Framework: Django, Django REST Framework (DRF)
    *   Authentication: `dj-rest-auth` with `django-allauth`
    *   Database ORM: Django ORM
    *   CORS Handling: `django-cors-headers`
    *   Language: Python
*   **Cloud Services / External Services:**
    *   Database: Supabase (Managed PostgreSQL)
    *   File Storage: Supabase Storage
    *   Payment Processing: Razorpay
*   **Development Tools:**
    *   Package Managers: npm, pip
    *   Version Control: Git

## Architecture

This project follows a standard client-server architecture:

*   **Frontend (Client):** A single-page application (SPA) built with React and TypeScript. It handles the user interface, user interactions, and communicates with the backend via a REST API. Vite serves the frontend during development and builds it for production.
*   **Backend (Server):** A RESTful API built with Django and Django REST Framework (DRF). It manages business logic, data persistence (database interactions via Supabase), user authentication, and serves data to the frontend.
*   **Database:** A managed PostgreSQL instance provided by Supabase.
*   **File Storage:** User-uploaded media files (e.g., menu item images) are stored using Supabase Storage.
*   **API Communication:** The frontend and backend communicate using REST principles, typically exchanging data in JSON format.

## File Structure

Here's a high-level overview of the project structure:

*   **Getting Started**

Follow these instructions to set up and run the project locally for development.

### Prerequisites

*   [Python](https://www.python.org/) (3.8+ recommended)
*   [Node.js](https://nodejs.org/) (LTS version recommended) and npm (or bun/yarn)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone (https://github.com/sushil930/canteen-flow.git)
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

    # Install dependencies
    pip install -r requirements.txt # (Ensure psycopg2-binary is in requirements.txt for Supabase)

    # Setup environment variables (See Environment Variables section below)
    # Create a .env file in this 'backend' directory.
    # Populate it with the necessary variables like Supabase DB credentials, Django SECRET_KEY, etc.

    # Apply database migrations (to your Supabase instance)
    python manage.py makemigrations
    python manage.py migrate

    # Create a superuser (for admin access and initial testing)
    python manage.py createsuperuser
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

This project requires environment variables for both backend and frontend configuration. Create `.env` files in the respective `backend` and `frontend` directories. These files are ignored by Git.

### Backend (`backend/.env`)

Create a file named `.env` in the `canteen-order-flow/backend/` directory with the following variables:

```env
# Django Core
SECRET_KEY=your_django_secret_key_here # Replace with a strong, unique secret key
DEBUG=True # Should be False in production

# Supabase Database Credentials
DB_NAME=postgres # Usually 'postgres' for Supabase, confirm in your Supabase dashboard
DB_USER=postgres # Usually 'postgres' for Supabase
DB_PASSWORD=your_supabase_db_password_here
DB_HOST=your_supabase_db_host_here # e.g., db.projectref.supabase.co
DB_PORT=5432 # Or your Supabase DB port if different

# Supabase Storage (if using django-storage-supabase or similar)
# SUPABASE_URL=https://your-project-ref.supabase.co
# SUPABASE_KEY=your_supabase_service_role_key_here # Service Role Key for backend operations
# SUPABASE_BUCKET=your_media_bucket_name

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Deployment Specific (primarily for production)
# ALLOWED_HOSTS=your_domain.com,localhost,127.0.0.1 # Comma-separated
# CORS_ALLOWED_ORIGINS=https://your_frontend_domain.com,http://localhost:5173 # Comma-separated
```

**Note on `SECRET_KEY`:** For local development, the one currently in `settings.py` is fine. For production, generate a new, strong one and set it only in the production environment.

### Frontend (`frontend/.env.local` or `.env`)

Create a file named `.env.local` (or `.env`) in the `canteen-order-flow/` directory (Vite loads .env files from the project root by default) with the following:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
# For production, this should be your deployed backend API URL:
# VITE_API_BASE_URL=https://your-backend-api.yourdomain.com/api

# If using Supabase client-side for storage viewing or other features:
# VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```
**Important:**
*   Only variables prefixed with `VITE_` are exposed to your Vite frontend client-side code.
*   Do **not** store any backend secrets (like `SUPABASE_KEY` if it's the service role key) in the frontend's `.env` file.

## API Overview (Key Endpoints)

<!-- ... existing code ... -->

## Deployment

This application is designed to be deployed with a cloud-hosted database and separate frontend/backend services.

*   **Database & Authentication:**
    *   The PostgreSQL database and user authentication are managed by **Supabase**. Ensure your production backend environment variables point to your live Supabase project.
*   **Media File Storage:**
    *   User-uploaded media files (e.g., menu item images) are intended to be stored using **Supabase Storage**. Configure `django-storage-supabase` (or a similar S3-compatible Django storage backend) and set the appropriate `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_BUCKET` environment variables in your backend.
*   **Backend (Django REST Framework):**
    *   The Django backend API should be deployed to a PaaS (Platform as a Service) like Render, Heroku, or Railway, or an IaaS like AWS EC2/DigitalOcean.
    *   **Key considerations for backend deployment:**
        *   Use a production-grade WSGI server (e.g., Gunicorn).
        *   Set `DEBUG = False` in `settings.py` (via environment variable).
        *   Configure `ALLOWED_HOSTS` to include your backend's domain.
        *   Configure `CORS_ALLOWED_ORIGINS` to include your frontend's production domain.
        *   Ensure all necessary environment variables (database credentials, `SECRET_KEY`, API keys, etc.) are securely set on the hosting platform.
        *   Run `python manage.py collectstatic` if serving static admin files directly from Django (or use a service like WhiteNoise).
*   **Frontend (React/Vite):**
    *   The Vite frontend should be built for production (`npm run build`).
    *   The resulting static assets (`dist` folder) can be deployed to a static hosting platform like Vercel (recommended for Vite apps), Netlify, or GitHub Pages.
    *   Ensure the `VITE_API_BASE_URL` environment variable in the frontend build points to the URL of your deployed backend API.

**Example Deployment Platforms:**

*   **Backend:** Render, Heroku, Railway
*   **Frontend:** Vercel, Netlify
*   **Database & Storage:** Supabase

## Contributing

<!-- ... existing code ... -->
