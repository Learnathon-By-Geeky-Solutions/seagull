from rest_framework.response import Response
from rest_framework import status, generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from decouple import config
from rest_framework.generics import RetrieveAPIView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.utils.encoding import force_str, DjangoUnicodeDecodeError, force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from .models import Instructor
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, DashboardStatsSerializer, LandingPageStatsSerializer, RegisterSerializer, LoginSerializer, InstructorSerializer, UserSerializer
from .services import DashboardStatsService, LandingPageStatsService

User = get_user_model()

# -------------------- AUTHENTICATION ---------------------------------

class RegisterView(generics.CreateAPIView):
    """
    Handles user registration.
    Sends a verification email with a unique token after successful registration.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        user.is_active = False
        user.save()

        self.send_verification_email(user)

        return Response({
            "message": "Registration successful! Please check your inbox (or spam folder) to verify your email address."
        }, status=status.HTTP_201_CREATED)

    def send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        domain = config('FRONTEND_DOMAIN')
        verification_link = f"{domain}/verify-email/{uid}/{token}/"

        html_message = render_to_string("users/verify_email.html", {
            'user': user,
            'verification_link': verification_link,
        })

        plain_message = strip_tags(html_message)

        send_mail(
            subject="Confirm Your Email to Get Started with KUETx",
            message=plain_message,
            from_email=config('EMAIL_HOST_USER'),
            recipient_list=[user.email],
            html_message=html_message
        )

# -------------- VERIFY EMAIL ----------------------------

class VerifyEmailAPIView(APIView):
    """Verify the email using uid and token."""
    permission_classes = [AllowAny]

    def get(self, _, uidb64, token):
        user = self.get_user_from_uid(uidb64)
        if not user:
            return Response({'error': 'Invalid or expired link'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Email verified successfully.",
            "refresh": str(refresh),
            "access": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        }, status=status.HTTP_200_OK)

    def get_user_from_uid(self, uidb64):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            return User.objects.get(pk=uid)
        except (TypeError, ValueError, User.DoesNotExist, DjangoUnicodeDecodeError):
            return None

# -------------------------- LOGIN -----------------------------

class LoginView(generics.GenericAPIView):
    """Authenticate user and return JWT tokens."""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# -------------------------- LOGOUT -----------------------------

class LogoutView(APIView):
    """Invalidate the refresh token on logout."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        

# ----------------------------- RESET PASSWORD --------------------------------

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = self.get_user_by_email(email)
        if user:
            self.send_reset_email(user, email)

        return Response({"message": "If this email exists, a password reset link has been sent."})

    def get_user_by_email(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    def send_reset_email(self, user, email):
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        reset_link = f"{config('FRONTEND_DOMAIN')}/reset-password/{uidb64}/{token}/"

        send_mail(
            subject="Reset Your Password",
            message=f"Click the link to reset your password: {reset_link}",
            from_email=config('EMAIL_HOST_USER'),
            recipient_list=[email],
            fail_silently=False,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = self.get_user_from_uid(uidb64)
        if not user or not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.password = make_password(password)
        user.save()
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

    def get_user_from_uid(self, uidb64):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            return User.objects.get(pk=uid)
        except (User.DoesNotExist, Exception):
            return None



# -------------------- TOKEN ---------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token pair view with role and is_superuser in payload."""
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view to retain custom claims."""
    serializer_class = CustomTokenRefreshSerializer



# -------------------- ADMIN PANEL ---------------------------------
class DashboardStatsView(APIView):
    """Provide stats for the admin dashboard."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        try:
            # Get and serialize dashboard stats
            stats_data = DashboardStatsService.get_dashboard_stats()
            serializer = DashboardStatsSerializer(stats_data)
            return Response(
                {
                    "success": True,
                    "message": "Dashboard stats fetched successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Failed to fetch dashboard stats.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# -------------------- LANDING PAGE STATS ---------------------------------
class LandingPageStatsView(APIView):
    """Provide stats for the landing page."""
    permission_classes=[AllowAny]

    def get(self, _request, *_args, **_kwargs):
        try:
            stats_data=LandingPageStatsService.get_landingpage_stats()
            serializer=LandingPageStatsSerializer(stats_data)
            return Response(
                {
                    "success":True,
                    "message": "Landing page stats fetched successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Failed to fetch landing page stats",
                    "error":str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ------------------------------- USERS -----------------------------------------
class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """Provides a list/detail of instructors."""
    permission_classes = [AllowAny]
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer

class InstructorDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Instructor.objects.select_related('user')
    serializer_class = InstructorSerializer
    lookup_field = 'id'  # or 'pk'


class ProfileView(APIView):
    """Allows authenticated users to view or update their profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        self._update_user_bio(user, data.get('bio'))
        if user.role == 'instructor':
            self._update_instructor_profile(user, data.get('instructor', {}))

        return Response(UserSerializer(user).data)

    def _update_user_bio(self, user, bio):
        if bio is not None:
            user.bio = bio
            user.save()

    def _update_instructor_profile(self, user, instructor_data):
        instructor, _ = Instructor.objects.get_or_create(user=user)
        instructor.designation = instructor_data.get('designation', instructor.designation)
        instructor.university = instructor_data.get('university', instructor.university)
        instructor.save()
