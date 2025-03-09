"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, LoginView, LogoutView, CustomTokenObtainPairView, AdminDashboardView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("register/", RegisterView.as_view(), name='register'),
    path("login/", LoginView.as_view(), name='login'),
    path("logout/", LogoutView.as_view(), name='logout'),

    path("token/",  CustomTokenObtainPairView.as_view(), name='get_token'),
    path("token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("api-auth/", include("rest_framework.urls")),

    # Admin Panel
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),

    path("courses/", include('courses.urls')),
    path("instructors/", include('users.urls')),
]
