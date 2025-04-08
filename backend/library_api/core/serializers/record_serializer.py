# --- START OF FILE: core/serializers/record_serializer.py (Add debug prints) ---

from rest_framework import serializers
from mongoengine.errors import DoesNotExist, ValidationError # Import errors
from mongoengine import get_connection, get_db # Import helpers
from core.models.record import Record
from core.models.user import User # Needed for validation checks
from core.models.book import Book # Needed for validation checks
import logging

logger = logging.getLogger(__name__)

from rest_framework import serializers
from mongoengine.errors import DoesNotExist, ValidationError
from core.models.user import User
from core.models.book import Book
import logging

logger = logging.getLogger(__name__)

class RecordSerializer(serializers.Serializer):
    # ... (fields definition remains the same) ...
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(required=True)
    book_id = serializers.CharField(required=True)
    fine = serializers.CharField(allow_null=True, required=False)
    issued_on = serializers.CharField(required=True)
    due_date = serializers.CharField(required=True)
    returned_on = serializers.CharField(allow_null=True, required=False)
    status = serializers.ChoiceField(choices=["0", "1"], required=True)


    # --- Validation Methods ---
    def validate_user_id(self, value):
        print(f"--- DEBUG (validate_user_id): Checking existence for user id='{value}' using count_documents ---")
        try:
            # Use PyMongo's count_documents directly on the collection object
            user_collection = User._get_collection()
            count = user_collection.count_documents({ 'id': value }) # Check custom string 'id' field
            print(f"--- DEBUG (validate_user_id): count_documents = {count} ---")

            if count > 0:
                return value # ID exists
            else:
                 raise serializers.ValidationError(f"User with ID '{value}' does not exist (count was 0).")

        except Exception as e: # Catch any potential error during count
            print(f"---! ERROR in validate_user_id during count: {type(e).__name__}: {e} !---")
            # Re-raise as validation error for DRF
            raise serializers.ValidationError(f"Error checking user ID '{value}'.")


    def validate_book_id(self, value):
        print(f"--- DEBUG (validate_book_id): Checking existence for book id='{value}' using count_documents ---")
        try:
            # Use PyMongo's count_documents directly
            book_collection = Book._get_collection()
            count = book_collection.count_documents({ 'id': value }) # Check custom string 'id' field
            print(f"--- DEBUG (validate_book_id): count_documents = {count} ---")

            if count > 0:
                return value # ID exists
            else:
                 raise serializers.ValidationError(f"Book with ID '{value}' does not exist (count was 0).")

        except Exception as e:
             print(f"---! ERROR in validate_book_id during count: {type(e).__name__}: {e} !---")
             raise serializers.ValidationError(f"Error checking book ID '{value}'.")

    # --- create/update methods as before ---
    def create(self, validated_data):
        record = Record(**validated_data)
        record.save()
        return record

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# --- END OF FILE: core/serializers/record_serializer.py ---