from rest_framework.response import Response
from rest_framework import status, generics, permissions, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, InstructorSerializer, UserSerializer
from .models import Instructor
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, DashboardStatsSerializer, LandingPageStatsSerializer
from .services import DashboardStatsService, LandingPageStatsService


# -------------------- AUTHENTICATION ---------------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens after registration
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": access_token
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [AllowAny]  # Allow logout without requiring access token

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the token

            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as _:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)



# -------------------- TOKEN ---------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer



# -------------------- ADMIN PANEL ---------------------------------
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        try:
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
    permission_classes = [AllowAny]
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        user.bio = data.get('bio', user.bio)
        user.save()
        if user.role == 'instructor':
            instructor, _ = Instructor.objects.get_or_create(user=user)
            instructor_data = data.get('instructor', {})
            instructor.designation = instructor_data.get('designation', instructor.designation)
            instructor.university = instructor_data.get('university', instructor.university)
            instructor.save()

        return Response(UserSerializer(user).data)