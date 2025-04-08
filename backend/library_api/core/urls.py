from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),                             # Django admin panel
    path('api/admin/', include('core.urls.admin_urls')),         # ✅ Custom admin API route
    path('users/', include('core.urls.users_urls')),
    path('books/', include('core.urls.books_urls')),
    path('records/', include('core.urls.records_urls')),
]
