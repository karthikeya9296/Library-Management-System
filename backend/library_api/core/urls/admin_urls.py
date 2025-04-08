from django.urls import path
from core.views.admin_views import admin_login

urlpatterns = [
    path('login/', admin_login, name='admin-login'),
]
