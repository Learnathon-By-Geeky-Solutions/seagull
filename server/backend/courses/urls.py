from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseDetailView

# router = DefaultRouter()
# router.register('', CourseViewSet, basename='courses')

# urlpatterns = [
#     path('', include(router.urls)),
# ]


urlpatterns = [
    path('', CourseViewSet.as_view({'get': 'list'}), name='all_courses'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course_detail'),
]