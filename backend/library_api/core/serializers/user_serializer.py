# --- CORRECTED core/serializers/user_serializer.py ---
from rest_framework import serializers
from core.models.user import User # Import your User model

class UserSerializer(serializers.Serializer):
    # 'id' is required by the model and needs to be included in validated_data
    # Remove read_only=True
    id = serializers.CharField(required=True) # Maps to custom string 'id' field
    name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(required=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Create/Update methods aren't strictly necessary if view handles saving,
    # but they don't hurt to have defined (ensure they use correct logic if used).
    # def create(self, validated_data):
    #     return User(**validated_data).save() # Assumes 'id' is in validated_data

    # def update(self, instance, validated_data):
    #     instance.modify(**validated_data)
    #     instance.reload()
    #     return instance