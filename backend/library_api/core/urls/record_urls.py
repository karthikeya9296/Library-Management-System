
from django.urls import path
# Import both views
from core.views.record_views import RecordList, RecordDetail

urlpatterns = [
    path("", RecordList.as_view(), name="record_list_create"),
    path("<str:pk>/", RecordDetail.as_view(), name="record_detail"),
]