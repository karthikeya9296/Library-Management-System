from rest_framework import serializers
from core.models.admin import Admin

class AdminSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    password = serializers.CharField()

    def create(self, validated_data):
        return Admin(**validated_data).save()

    def update(self, instance, validated_data):
        instance.update(**validated_data)
        return instance
