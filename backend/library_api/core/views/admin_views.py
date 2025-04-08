
from django.views.decorators.csrf import csrf_exempt # Import csrf_exempt
from rest_framework.decorators import api_view        # Import api_view
from rest_framework.response import Response
from rest_framework import status
from core.models.admin import Admin
import bcrypt # Make sure bcrypt is installed (pip install bcrypt)
import logging

logger = logging.getLogger(__name__)

@csrf_exempt # Exempt from CSRF check
@api_view(['POST']) # Use DRF's decorator
def admin_login(request):
    # Data is in request.data when using @api_view
    email = request.data.get('email')
    password = request.data.get('password')
    print (f"Email: {email}, Password: {password}")  # Debugging line
    if not email or not password:
        logger.warning(f"Admin login attempt failed: Email or password missing. Email provided: '{email}'")
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Look up user by email ONLY
        admin = Admin.objects(email=email).get()
        print (f"Admin: {admin}")  # Debugging line
        # 2. Compare provided password with stored hash using bcrypt
        if bcrypt.checkpw(password.encode('utf-8'), admin.password.encode('utf-8')):
            # Password matches!
            admin_id_str = str(admin.id)
            logger.info(f"Admin login successful for email: {email}, ID: {admin_id_str}")
            return Response({
                "message": "Admin login successful",
                "admin_id": admin_id_str
            }, status=status.HTTP_200_OK)
        else:
            # Password does NOT match
            logger.warning(f"Admin login attempt failed: Invalid password for email: {email}")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    except Admin.DoesNotExist:
        # Email not found
        logger.warning(f"Admin login attempt failed: Email not found: {email}")
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        # Catch unexpected errors (like bcrypt errors if hash is invalid)
        logger.error(f"An unexpected error occurred during admin login for email {email}: {e}", exc_info=True)
        return Response({"error": "An internal server error occurred. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- get_admin view ---
@api_view(['GET'])
def get_admin(request):
    # Add authentication here later if needed
    try:
        admins = Admin.objects()
        admin_data = [{"id": str(admin.id), "name": getattr(admin, 'name', None), "email": admin.email} for admin in admins] # Added getattr for safety if 'name' doesn't exist
        return Response(admin_data)
    except Exception as e:
        logger.error(f"An error occurred getting admins: {e}", exc_info=True)
        return Response({"error": "An internal server error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)