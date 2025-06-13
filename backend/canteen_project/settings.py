INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'allauth', # Needs to be present for dj_rest_auth
    # 'allauth.account', # Keep commented - we use custom registration
    # 'allauth.socialaccount', # Removed due to SQLite JSONField issue
    'corsheaders', # Add corsheaders

    # Local apps
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Add CORS middleware FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'allauth.account.middleware.AccountMiddleware', # Keep commented
]

# CORS Configuration
# Ensure this matches your frontend development server URL
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
]

# If you need to allow credentials (like cookies or auth tokens) from the frontend:
CORS_ALLOW_CREDENTIALS = True

# Optional: Allow specific headers if needed (usually defaults are fine)
# CORS_ALLOW_HEADERS = [...] 

# Optional: Allow specific methods (usually defaults are fine)
# CORS_ALLOW_METHODS = [...] 

# ... rest of the settings ... 