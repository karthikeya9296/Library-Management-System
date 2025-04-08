
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status # Import status codes
# Import NotUniqueError for handling duplicate key errors on save/update
from mongoengine.errors import DoesNotExist, ValidationError, NotUniqueError

from core.models.user import User
from core.serializers.user_serializer import UserSerializer
import logging

logger = logging.getLogger(__name__)

class UserList(APIView):
    def get(self, request):
        try:
            users = User.objects().all()
            for user in users:
                # Convert ObjectId to string for easier debugging and logging
                user.id = str(user.id) if user.id else None
                print(f"--- DEBUG User: User ID: {user.id}, Name: {user.name}, Email: {user.email}, Mobile: {user.mobile}") # Debug print
                # Print user details for debugging
            serializer = UserSerializer(users, many=True)
            print(f"--- DEBUG : Fetched {serializer} User objects.") # Debug print
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching user list: {e}", exc_info=True)
            return Response({"error": "Failed to retrieve users"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
    def post(self, request):
        print("--- DEBUG: Entering UserList POST ---")
        print(f"--- DEBUG: Received POST data: {request.data}") # Log received data

        serializer = UserSerializer(data=request.data)
        is_valid = serializer.is_valid() # Store result
        print(f"--- DEBUG: Serializer is_valid(): {is_valid} ---")

        if is_valid:
            try:
                # ID MUST be in validated_data now as model requires it
                print(f"--- DEBUG: Serializer validated_data: {serializer.validated_data}")
                user_instance = User(**serializer.validated_data)

                print("--- DEBUG: Attempting user_instance.save() ---")
                user_instance.save() # This can raise NotUniqueError, ValidationError

                logger.info(f"User created successfully with ID: {user_instance.id}")
                created_serializer = UserSerializer(user_instance)
                return Response(created_serializer.data, status=status.HTTP_201_CREATED)

            except NotUniqueError as e:
                logger.warning(f"User creation failed - uniqueness constraint violated: {e}", data=request.data)
                error_field = "ID, email, or mobile" # More generic message
                # Try to identify specific field if possible from error message 'e'
                if 'email' in str(e): error_field = 'email'
                elif 'mobile' in str(e): error_field = 'mobile'
                elif 'id_1' in str(e) or '_id_ ' in str(e): error_field = 'ID' # Mongo index names for ID
                return Response({"error": f"User with this {error_field} already exists."}, status=status.HTTP_400_BAD_REQUEST)

           # --- CORRECTED core/views/user_views.py -> UserList.post -> except ValidationError ---
            except ValidationError as ve:
                 # Log the validation error AND the problematic data separately or formatted in message
                 log_message = f"User creation validation error during save: {ve}. Request data: {request.data}"
                 logger.error(log_message, exc_info=True) # Removed invalid 'data=' argument
                 return Response({"error": f"Data validation failed during save: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 logger.error(f"Error creating user during save: {e}", data=request.data, exc_info=True)
                 print(f"---! ERROR CAUGHT during save (Users): {type(e).__name__}: {e} !---")
                 return Response({"error": "Failed to save user to database"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # ---> Log the validation errors <---
            print(f"--- DEBUG: User Serializer Validation Errors: {serializer.errors} ---")
            logger.warning(f"User creation validation failed: {serializer.errors}", data=request.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserDetail(APIView):
    
    
    def get_object(self, user_custom_id): # Changed parameter name for clarity
        """ Retrieve user by the custom string ID field """
        try:
            # Explicitly query using the 'id' string field
            return User.objects.get(id=user_custom_id)
        except (DoesNotExist):
             logger.warning(f"User lookup failed: User with custom ID '{user_custom_id}' not found.")
             return None
        except (ValidationError): # Catch potential format errors if pk is invalid
             logger.warning(f"User lookup failed: Invalid ID format '{user_custom_id}'.")
             return None

    # GET, PUT, DELETE methods below now receive the user_custom_id as 'pk' from the URL
    # but they use the corrected get_object method above.
    def get(self, request, pk): # 'pk' from URL is the user_custom_id
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... (rest of get is fine) ...
        try:
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error serializing user {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to retrieve user details"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk): # 'pk' from URL is the user_custom_id
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... (rest of put is fine, uses modify correctly) ...
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
             try:
                  update_data = serializer.validated_data
                  user.modify(**update_data)
                  user.reload()
                  logger.info(f"User {pk} updated successfully.")
                  updated_serializer = UserSerializer(user)
                  return Response(updated_serializer.data)
             # ... (rest of try/except for put) ...
             except NotUniqueError as e: # Handle uniqueness
                logger.warning(f"User update failed for ID {pk} - uniqueness constraint violated: {e}", data=request.data)
                error_field = "email or mobile"
                if 'email' in str(e): error_field = 'email'
                elif 'mobile' in str(e): error_field = 'mobile'
                return Response({"error": f"Another user with this {error_field} already exists."}, status=status.HTTP_400_BAD_REQUEST)
             except ValidationError as ve:
                 logger.error(f"User update validation error during save: {ve}", data=request.data, exc_info=True)
                 return Response({"error": f"Data validation failed during save: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
             except Exception as e:
                logger.error(f"Error updating user {pk}: {e}", data=request.data, exc_info=True)
                return Response({"error": "Failed to update user in database"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logger.warning(f"User update validation failed for ID {pk}: {serializer.errors}", data=request.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk): # 'pk' from URL is the user_custom_id
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... (rest of delete is fine) ...
        try:
            user_id_log = user.id
            user.delete()
            logger.info(f"User {user_id_log} deleted successfully.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting user {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to delete user"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)