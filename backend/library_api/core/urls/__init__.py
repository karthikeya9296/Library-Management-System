from django.urls import path, include

urlpatterns = [
    path("admin/", include("core.urls.admin_urls")),
    path("users/", include("core.urls.user_urls")),
    path("books/", include("core.urls.book_urls")),
    path("records/", include("core.urls.record_urls")),
]
