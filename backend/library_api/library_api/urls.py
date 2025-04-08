# E:\Freelance\ID-KARTHIK\Software\backend\library_api\library_api\urls.py

from django.urls import path, include

urlpatterns = [
    # Include all URLs defined in core/urls/__init__.py under the 'api/' prefix
    path('api/', include('core.urls')), # This line includes all core app urls
]