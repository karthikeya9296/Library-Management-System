from rest_framework import serializers
from core.models.book import Book # Import your Book model

class BookSerializer(serializers.Serializer):
    # This now correctly maps to the StringField primary key 'id' in the model
    id = serializers.CharField(required=True) # Maps to custom string 'id' field
    b_name = serializers.CharField(required=True)
    author = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    genre = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    stock = serializers.IntegerField(required=False, default=0)

    # Create/Update logic is typically handled in the view for MongoEngine unless using drf-mongoengine