
from django.urls import path
# Import both views
from core.views.book_views import BookList, BookDetail

urlpatterns = [
    path("", BookList.as_view(), name="book_list_create"),
    path("<str:pk>/", BookDetail.as_view(), name="book_detail"),
]