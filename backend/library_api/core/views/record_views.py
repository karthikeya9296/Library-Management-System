# --- START OF FILE: core/views/record_views.py (Complete with logging fix) ---

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Import models needed for validation or type hinting if desired
from core.models.user import User
from core.models.book import Book
from core.models.record import Record
# Import MongoEngine errors and connection helpers
from mongoengine.errors import DoesNotExist, ValidationError
from mongoengine import get_connection, get_db
# Import serializer
from core.serializers.record_serializer import RecordSerializer
import logging

logger = logging.getLogger(__name__)

class RecordList(APIView):
    def get(self, request):
        try:
            print("--- DEBUG: Entering RecordList GET ---")

            # 1. Check Connection Details AT QUERY TIME
            try:
                db = get_db()
                conn_details = get_connection()
                print(f"--- DEBUG: MongoEngine Using DB: '{db.name}' via Connection Alias: '{conn_details.alias}' ---")
            except Exception as conn_e:
                 print(f"---! ERROR Getting DB/Connection details (Records): {conn_e} !---")

            # 2. Check Collection Name AT QUERY TIME
            try:
                collection_name = Record._get_collection_name()
                collection_obj = Record._get_collection()
                print(f"--- DEBUG: Model expects collection: '{collection_name}' (Type: {type(collection_obj)}) ---")
            except Exception as col_e:
                print(f"---! ERROR Getting Collection details (Records): {col_e} !---")

            # 3. Try a simpler count query first
            try:
                record_count = Record.objects.count()
                print(f"--- DEBUG: Record.objects.count() = {record_count} ---") # Should be > 0 if records exist
            except Exception as count_e:
                print(f"---! ERROR during Record.objects.count(): {count_e} !---")

            # 4. Execute the .all() query
            print("--- DEBUG: Executing Record.objects.all() ---")
            records = Record.objects.all()

            # 5. Process results
            record_list = list(records)
            print(f"--- DEBUG: Fetched {len(record_list)} Record documents from DB.")

            if not record_list:
                 print("--- DEBUG: No record documents found by query. Returning empty list. ---")
                 return Response([])

            serializer = RecordSerializer(record_list, many=True)
            serialized_data = serializer.data
            print(f"--- DEBUG: Serialized record data length: {len(serialized_data)}")

            return Response(serialized_data)

        except Exception as e:
             logger.error(f"Error fetching record list: {e.__class__.__name__} - {e}", exc_info=True)
             print(f"---! TOP LEVEL ERROR CAUGHT (Records GET): {type(e).__name__}: {e} !---")
             return Response({"error": "Failed to retrieve records"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        print("--- DEBUG: Entering RecordList POST ---")
        print(f"--- DEBUG: Received POST data: {request.data}")

        serializer = RecordSerializer(data=request.data)
        is_valid = serializer.is_valid() # This calls validate_user_id/book_id
        print(f"--- DEBUG: Serializer is_valid(): {is_valid} ---")

        if is_valid:
            try:
                # User/Book existence confirmed by serializer validation
                print(f"--- DEBUG: Serializer validated_data: {serializer.validated_data}")
                record_instance = Record(**serializer.validated_data)

                print("--- DEBUG: Attempting record_instance.save() ---")
                record_instance.save()

                logger.info(f"Record created successfully for User ID: {serializer.validated_data['user_id']}, Book ID: {serializer.validated_data['book_id']}")
                created_serializer = RecordSerializer(record_instance)
                return Response(created_serializer.data, status=status.HTTP_201_CREATED)

            except ValidationError as ve:
                 logger.error(f"Record creation validation error during save: {ve}", data=request.data, exc_info=True)
                 return Response({"error": f"Data validation failed during save: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 logger.error(f"Error creating record during save: {e}", data=request.data, exc_info=True)
                 print(f"---! ERROR CAUGHT during save (Records): {type(e).__name__}: {e} !---")
                 return Response({"error": "Failed to save record"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Log the validation errors - Corrected logging call
            print(f"--- DEBUG: Record Serializer Validation Errors: {serializer.errors} ---")
            log_message = f"Record creation validation failed: {serializer.errors}. Request data: {request.data}"
            # --- THIS LINE IS FIXED ---
            logger.warning(log_message, exc_info=False) # Removed invalid 'data=', set exc_info=False if traceback not needed here
            # --- THIS LINE IS FIXED ---
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # Return errors from serializer

# --- RecordDetail Class (Handles PUT/DELETE/GET single) ---
class RecordDetail(APIView):
    def get_object(self, pk):
        """ Retrieve record by its default MongoDB _id (passed as pk) """
        try:
            return Record.objects.get(pk=pk) # Default lookup by _id
        except (DoesNotExist):
            logger.warning(f"Record lookup failed: Record with PK '{pk}' not found.")
            return None
        except (ValidationError): # Handles invalid ObjectId format for pk
            logger.warning(f"Record lookup failed: Invalid PK format '{pk}'.")
            return None

    def get(self, request, pk):
        record = self.get_object(pk)
        if record is None:
            return Response({"error": "Record not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        try:
            serializer = RecordSerializer(record)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error serializing record {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to retrieve record details"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        record = self.get_object(pk)
        if record is None:
            return Response({"error": "Record not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid(): # This still calls validate_user_id/book_id if they are present in request data
            try:
                update_data = serializer.validated_data
                record.modify(**update_data)
                record.reload()
                logger.info(f"Record {pk} updated successfully.")
                updated_serializer = RecordSerializer(record)
                return Response(updated_serializer.data)
            except ValidationError as ve:
                 # Removed 'data=' arg from logger call
                 log_message = f"Record update validation error during modify: {ve}. Request data: {request.data}"
                 logger.error(log_message, exc_info=True)
                 return Response({"error": f"Data validation failed during update: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Removed 'data=' arg from logger call
                log_message = f"Error updating record {pk}: {e}. Request data: {request.data}"
                logger.error(log_message, exc_info=True)
                return Response({"error": "Failed to update record"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Log validation errors on PUT failure - Corrected logger call
        print(f"--- DEBUG: Record Update Serializer Validation Errors: {serializer.errors} ---")
        log_message = f"Record update validation failed for PK {pk}: {serializer.errors}. Request data: {request.data}"
        logger.warning(log_message, exc_info=False) # Removed invalid 'data='
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = self.get_object(pk)
        if record is None:
            return Response({"error": "Record not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        try:
            record_pk_log = record.pk # Get pk before deleting
            record.delete()
            logger.info(f"Record {record_pk_log} deleted successfully.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting record {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to delete record"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- END OF FILE: core/views/record_views.py ---