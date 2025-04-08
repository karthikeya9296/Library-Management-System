
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Import NotUniqueError although less likely needed here unless other unique fields are added
from mongoengine.errors import DoesNotExist, ValidationError, NotUniqueError

from core.models.book import Book
from core.serializers.book_serializer import BookSerializer
import logging

logger = logging.getLogger(__name__)

class BookList(APIView):
    def get(self, request):
        try:
            print("--- DEBUG: Entering BookList GET ---")
            books = Book.objects.all()
            
            book_list = list(books)
            print(f"--- DEBUG: Fetched {len(book_list)} Book documents from DB.")
            print(f"--- DEBUG Books: Fetched {books} Book documents from DB.") # Debug print
            
            if not book_list:
                print("--- DEBUG: No book documents found. Returning empty list. ---")
                return Response([]) # Return empty list explicitly if query returns nothing
             
            serializer = BookSerializer(book_list, many=True)
            serialized_data = serializer.data
            print(f"--- DEBUG: Serialized book data length: {len(serialized_data)}")
            return Response(serialized_data)
        except Exception as e:
           logger.error(f"Error fetching user list: {e}", exc_info=True)
           print(f"--- ERROR CAUGHT IN UserList.get: {type(e).__name__}: {e} ---") # <--- Add this print

           return Response({"error": "Failed to retrieve users"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
         print("--- DEBUG: Entering BookList POST ---")
         print(f"--- DEBUG: Received POST data: {request.data}")

         serializer = BookSerializer(data=request.data)
         is_valid = serializer.is_valid()
         print(f"--- DEBUG: Serializer is_valid(): {is_valid} ---")

         if is_valid:
            try:
                # ID MUST be in validated_data
                print(f"--- DEBUG: Serializer validated_data: {serializer.validated_data}")
                book_instance = Book(**serializer.validated_data)

                print("--- DEBUG: Attempting book_instance.save() ---")
                book_instance.save()

                logger.info(f"Book created successfully with ID: {book_instance.id}")
                created_serializer = BookSerializer(book_instance)
                return Response(created_serializer.data, status=status.HTTP_201_CREATED)

            except NotUniqueError as e: # Primarily duplicate custom 'id'
                logger.warning(f"Book creation failed - uniqueness constraint violated (likely ID): {e}", data=request.data)
                return Response({"error": f"Book with this ID already exists."}, status=status.HTTP_400_BAD_REQUEST)
            except ValidationError as ve:
                 logger.error(f"Book creation validation error during save: {ve}", data=request.data, exc_info=True)
                 return Response({"error": f"Data validation failed during save: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 logger.error(f"Error creating book during save: {e}", data=request.data, exc_info=True)
                 print(f"---! ERROR CAUGHT during save (Books): {type(e).__name__}: {e} !---")
                 return Response({"error": "Failed to save book"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         else:
            # ---> Log the validation errors <---
            print(f"--- DEBUG: Book Serializer Validation Errors: {serializer.errors} ---")
            logger.warning(f"Book creation validation failed: {serializer.errors}", data=request.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# --- REVISED core/views/book_views.py -> BookDetail ---
class BookDetail(APIView):
    def get_object(self, book_custom_id): # Changed parameter name
        """ Retrieve book by the custom string ID field """
        try:
            # Explicitly query using the 'id' string field
            return Book.objects.get(id=book_custom_id)
        except (DoesNotExist):
            logger.warning(f"Book lookup failed: Book with custom ID '{book_custom_id}' not found.")
            return None
        except (ValidationError):
             logger.warning(f"Book lookup failed: Invalid ID format '{book_custom_id}'.")
             return None

    # GET, PUT, DELETE methods use 'pk' from URL which contains the book_custom_id
    def get(self, request, pk):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... rest of get is fine ...
        try:
            serializer = BookSerializer(book)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error serializing book {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to retrieve book details"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def put(self, request, pk):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... rest of put is fine ...
        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                update_data = serializer.validated_data
                book.modify(**update_data)
                book.reload()
                logger.info(f"Book {pk} updated successfully.")
                updated_serializer = BookSerializer(book)
                return Response(updated_serializer.data)
            except ValidationError as ve:
                 # Log the validation error AND the problematic data separately or formatted in message
                 log_message = f"User creation validation error during save: {ve}. Request data: {request.data}"
                 logger.error(log_message, exc_info=True) # Removed invalid 'data=' argument
                 return Response({"error": f"Data validation failed during save: {ve}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error updating book {pk}: {e}", data=request.data, exc_info=True)
                return Response({"error": "Failed to update book"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        logger.warning(f"Book update validation failed for ID {pk}: {serializer.errors}", data=request.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)
        # ... rest of delete is fine ...
        try:
            book_id_log = book.id
            book.delete()
            logger.info(f"Book {book_id_log} deleted successfully.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
             logger.error(f"Error deleting book {pk}: {e}", exc_info=True)
             return Response({"error": "Failed to delete book"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)