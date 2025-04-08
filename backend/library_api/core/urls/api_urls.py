from django.urls import path
from core.views.admin_views import get_admin

urlpatterns = [
    path('admin', get_admin),
]
