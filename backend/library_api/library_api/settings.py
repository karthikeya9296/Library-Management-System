# E:\Freelance\ID-KARTHIK\Software\backend\library_api\library_api\settings.py
import os
from pathlib import Path
from dotenv import load_dotenv
from mongoengine import connect, get_connection # Import helpers

load_dotenv()

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = Path(__file__).resolve().parent.parent # More standard way


SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', '1234567890abcdef') # Use env variable or default
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

# Add your domain/IP when DEBUG=False
ALLOWED_HOSTS = [] # Or load from environment variable


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',  # Required for admin styling
    'rest_framework',
    'corsheaders', # Added corsheaders
    'core',        # Your app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Moved higher, before CommonMiddleware
    'django.middleware.common.CommonMiddleware', # Keep only one
    'django.middleware.csrf.CsrfViewMiddleware', # Keep only one
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # Good practice to include
]


ROOT_URLCONF = 'library_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Optional: you can add custom template paths here
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',  # Required for admin
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'library_api.wsgi.application'


# Database
# Using MongoEngine, so standard DATABASES is not used
DATABASES = {}


# Password validation (optional, for Django auth if used elsewhere)
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    # ... default validators ...
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_URL = '/static/'
# STATIC_ROOT = BASE_DIR / 'staticfiles' # Uncomment if you need to collect static files


# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- MongoEngine Connection ---
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'library_db')
MONGO_HOST = os.getenv('MONGO_HOST', 'mongodb://localhost:27017')
MONGO_URI = f'{MONGO_HOST}/{MONGO_DB_NAME}'

try:
    connect(db=MONGO_DB_NAME, host=MONGO_URI)
    conn = get_connection()
    print(f"--- MongoDB connection established successfully! Alias: {conn.alias}, DB: {MONGO_DB_NAME} ---")
except Exception as e:
    print(f"--- FATAL ERROR connecting to MongoDB: {e} ---")
    # Optionally raise the error again or exit if DB connection is critical at startup
    # raise e

# --- CORS Settings ---
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', "http://localhost:3000,http://127.0.0.1:3000").split(',')
CORS_ALLOW_CREDENTIALS = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.1.105'] # Add your IP
# --- CSRF Settings ---
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', "http://localhost:3000,http://127.0.0.1:3000").split(',')


# --- REST Framework Settings (Optional) ---
REST_FRAMEWORK = {
    # Add any default DRF settings here, e.g., authentication, permissions
    # 'DEFAULT_AUTHENTICATION_CLASSES': [
    #     'rest_framework.authentication.SessionAuthentication',
    # ],
    # 'DEFAULT_PERMISSION_CLASSES': [
    #     'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    # ]
}