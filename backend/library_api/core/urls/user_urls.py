
from django.urls import path
# Import both UserList and UserDetail from user_views
from core.views.user_views import UserList, UserDetail

urlpatterns = [
    # Path for listing users (GET) and creating a user (POST)
    path("", UserList.as_view(), name="user_list_create"),
    # Path for getting (GET), updating (PUT), and deleting (DELETE) a specific user
    # <str:pk> captures the MongoDB ObjectId as a string
    path("<str:pk>/", UserDetail.as_view(), name="user_detail"),
]