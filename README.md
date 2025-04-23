# Canteen Flow - Smart Campus Food Ordering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Optional: Add license badge if applicable -->

Canteen Flow is a modern, full-stack web application designed to streamline the food ordering process within a campus environment. It provides an intuitive interface for users to browse menus, place orders, and manage their dining experience, along with a robust admin panel for canteen staff to manage offerings and orders.

<!-- Optional: Add a screenshot or GIF here -->
<!-- ![Canteen Flow Screenshot](link/to/your/screenshot.png) -->

## Features

**User Features:**

*   **Canteen Selection:** Choose from available canteens on campus.
*   **Menu Browsing:** View menu items categorized for easy navigation (e.g., Main Course, Drinks, Snacks).
*   **Item Details:** See item names, descriptions, prices, and images.
*   **Category Filtering:** Filter menu items by category or view all items.
*   **Shopping Cart:** Add/remove items, adjust quantities, and view the running total.
*   **Order Placement:** Submit orders associated with a selected table number.
*   **Order Confirmation:** Receive confirmation with an Order ID and table number.
*   **User Authentication:** Secure registration and login for personalized experience.
*   **Order History:** (Planned/Optional) View past orders.

**Admin Features:**

*   **Admin Dashboard:** Centralized management interface.
*   **Canteen Management:** Full CRUD (Create, Read, Update, Delete) operations for canteens.
*   **Menu Item Management:** Full CRUD operations for menu items, including image uploads.
*   **Order Management:** View incoming orders with associated items, quantities, total price, customer details, and table number.
*   **Order Status Updates:** (Planned/Optional) Update the status of orders (e.g., Preparing, Ready, Delivered).

## Technology Stack

*   **Frontend:**
    *   Framework: React (with Vite)
    *   Language: TypeScript
    *   Styling: Tailwind CSS
    *   UI Components: shadcn/ui, Lucide Icons
    *   State Management: React Context API (`useAuth`, `useOrder`)
    *   Data Fetching: React Query (`useQuery`, `useMutation`)
    *   Routing: React Router
    *   Animations: Framer Motion
*   **Backend:**
    *   Framework: Django, Django REST Framework (DRF)
    *   Language: Python
    *   Database: SQLite (for development, configurable for production)
    *   Authentication: Django's built-in auth, potentially parts of `django-allauth`
    *   API Handling: `django-cors-headers`

## Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

*   [Python](https://www.python.org/) (3.8+ recommended)
*   [Node.js](https://nodejs.org/) (LTS version recommended) and npm, OR [Bun](https://bun.sh/)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd canteen-order-flow # Or your project's root directory name
    ```

2.  **Backend Setup:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Create and activate a virtual environment (recommended)
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate

    # Install Python dependencies
    pip install -r requirements.txt # Ensure you have a requirements.txt file

    # Apply database migrations
    python manage.py makemigrations
    python manage.py migrate

    # Create a superuser for accessing the Django admin (optional)
    python manage.py createsuperuser

    # (Optional) Create a .env file based on .env.example if provided
    # cp .env.example .env
    # # --> Fill in necessary backend environment variables (SECRET_KEY, etc.)

    # Run the backend development server (usually on port 8000)
    python manage.py runserver
    ```

3.  **Frontend Setup:**
    ```bash
    # Navigate back to the project root and then to the frontend directory (if not already done)
    # cd .. # From backend directory

    # Install frontend dependencies (choose one)
    npm install
    # OR
    # bun install

    # (Optional) Create a .env file based on .env.example if provided
    # cp .env.example .env
    # # --> Fill in necessary frontend environment variables (e.g., VITE_BACKEND_URL=http://127.0.0.1:8000)

    # Run the frontend development server (usually on port 5173 or 8080)
    npm run dev
    # OR
    # bun run dev
    ```

4.  **Access the Application:**
    *   Frontend: Open your browser to `http://localhost:5173` (or the port specified by Vite/Bun).
    *   Backend API: Accessible at `http://localhost:8000/api/`.
    *   Django Admin: `http://localhost:8000/admin/` (requires superuser login).

## Environment Variables

This project may require environment variables for configuration (e.g., API keys, secret keys, database URLs).

*   Check for `.env.example` files in both the `frontend` and `backend` directories.
*   Create corresponding `.env` files by copying the examples: `cp .env.example .env`
*   Fill in the required values in your `.env` files. These files are ignored by Git (`.gitignore`).

## API Overview (Key Endpoints)

*   `/api/canteens/`: List available canteens.
*   `/api/categories/?canteen=<id>`: Get categories for a specific canteen.
*   `/api/menu-items/?canteen=<id>`: Get menu items for a specific canteen.
*   `/api/orders/`: Place new orders (POST), view user's orders (GET). (Requires Auth)
*   `/api/auth/`: Endpoints for login, logout, registration (specific paths may vary).
*   `/api/admin/`: Endpoints for admin management of canteens, menu items. (Requires Staff Auth)
*   `/admin/`: Standard Django administration interface.

## Contributing

Contributions are welcome! Please follow standard Git workflow:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details (Optional: Create a LICENSE.md file if you choose a license).
