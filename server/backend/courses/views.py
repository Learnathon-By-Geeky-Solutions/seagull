from rest_framework import generics, viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Course, CourseContents, Enrollment, Rating
from .serializers import CourseSerializer, CourseContentsSerializer

class AdminOnlyAPIView(APIView):
    """Base class for admin-only operations."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_course_or_404(self, course_id):
        # Helper function to fetch course or return 404 if not found
        return get_object_or_404(Course, id=course_id)
        
    def handle_serializer(self, serializer, status_code=status.HTTP_200_OK):
        """Common handler for serializer validation and response."""
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdminOrInstructorOwner(APIView):
    """
    Custom permission to allow:
    - Admins full access.
    - Instructors can only manage their own courses and contents.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.is_staff:
            return True

        # Instructors: can only modify their OWN course/content
        if hasattr(request.user, 'instructor'):
            if isinstance(obj, Course):
                return obj.created_by.user == request.user

            if isinstance(obj, CourseContents):
                return obj.course.created_by.user == request.user

        return False

class InstructorOrAdminAPIView(APIView):
    """Base class for instructor (own content) and admin (all content) operations."""
    permission_classes = [IsAuthenticated, IsAdminOrInstructorOwner]

    def get_course_or_404(self, course_id):
        return get_object_or_404(Course, id=course_id)

    def handle_serializer(self, serializer, status_code=status.HTTP_200_OK):
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public viewset to list and search courses.
    Only supports read operations.
    """
    permission_classes = [AllowAny]
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']   # Fields to search against
    
    def get_queryset(self):
        queryset = Course.objects.all()
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(Q(title__icontains=search_query))
        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    """
    View to retrieve a single course's details.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]  # Only authenticated users can view course details
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

#  ---------------------------- COURSE MANAGEMENT -------------------------------
class AddCourseView(InstructorOrAdminAPIView):
    """Admin endpoint to add a new course."""
    def post(self, request):
        data = request.data.copy()

        if request.user.role == 'instructor':
            # Force created_by to logged-in instructor
            data['created_by'] = request.user.instructor.id

        serializer = CourseSerializer(data=request.data)
        return self.handle_serializer(serializer, status.HTTP_201_CREATED)


class UpdateDeleteCourseView(InstructorOrAdminAPIView):
    """Admin endpoint to update or delete an existing course."""
    def put(self, request, course_id):
         # Update an existing course
        course = self.get_course_or_404(course_id)        
        serializer = CourseSerializer(course, data=request.data, partial=True)
        return self.handle_serializer(serializer)

    def delete(self, request, course_id):
        # Delete an existing course
        course = self.get_course_or_404(course_id)

        if request.user.role == 'instructor' and course.created_by.user != request.user:
            return Response({'detail': 'You do not have permission to delete this course.'}, status=status.HTTP_403_FORBIDDEN)
        
        course.delete()
        return Response({"message": "Course deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# ----------------------------- ENROLLMENT ---------------------------------

class UserEnrollmentMixin:
    """Check if the student is enrolled in the course."""
    def is_student_enrolled(self, user, course):
        return hasattr(user, 'student') and Enrollment.objects.filter(course=course, student=user.student).exists()
    

class EnrollCourseView(APIView):
    """
    Endpoint for students to enroll in a course.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user
        if not hasattr(user, 'student'):
            return Response({"error": "Only students can enroll in courses"}, status=status.HTTP_403_FORBIDDEN)

        course = get_object_or_404(Course, id=course_id)
        _, created = Enrollment.objects.get_or_create(course=course, student=user.student)

        message = "Successfully enrolled in {}!".format(course.title) if created else "Already enrolled"
        status_code = status.HTTP_200_OK if created else status.HTTP_400_BAD_REQUEST
        
        return Response({"message": message}, status=status_code)


class EnrolledCoursesView(generics.ListAPIView):
    """
    List courses a student is enrolled in.
    """
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
         # Get the list of courses the student is enrolled in
        user = self.request.user
        if not hasattr(user, 'student'):
            return Course.objects.none()
        
        return Course.objects.filter(enrollment__student=user.student)

# ------------------------------- COURSE CONTENTS ----------------------------------

class CourseContentsView(UserEnrollmentMixin, generics.ListAPIView):
    """
    View to list course contents for enrolled students.
    """
    serializer_class = CourseContentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
         # Get course contents for the enrolled student
       
        user = self.request.user         # Retrieve the currently authenticated user making the request
        course = get_object_or_404(Course, id=self.kwargs['course_id'])

         # Ensure the user is enrolled before returning contents
        if not self.is_student_enrolled(user, course):
            return CourseContents.objects.none()

        return CourseContents.objects.filter(course=course)


class AddContentAPIView(InstructorOrAdminAPIView):
    """
    Admin can add content to a course.
    """
    def post(self, request):
         # Admin adds content to a course
        self.get_course_or_404(request.data.get('course'))
        serializer = CourseContentsSerializer(data=request.data)
        return self.handle_serializer(serializer, status.HTTP_201_CREATED)


class UpdateContentView(InstructorOrAdminAPIView):
    """
    Admin can update existing content.
    """
    def put(self, request, id):
         # Admin updates course content
        content = get_object_or_404(CourseContents, id=id)
        serializer = CourseContentsSerializer(content, data=request.data, partial=True)
        return self.handle_serializer(serializer)


class DeleteContentView(InstructorOrAdminAPIView):
    """
    Admin can delete content from a course.
    """
    def delete(self, request, id):
        # Admin deletes content from a course
        get_object_or_404(CourseContents, id=id).delete()
        return Response({'message': 'Content deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

# ------------------- INSTRUCTORS COURSES --------------------------------------

class InstructorCoursesView(generics.ListAPIView):
    """
    List all courses created by an instructor.
    """
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
         # Ensure only instructors can access their courses
        user = request.user
        if not hasattr(user, 'instructor'):
            return Response(
                {"error": "Only instructors can view this information."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        courses = Course.objects.filter(created_by=user.instructor)
        serialized_courses = CourseSerializer(courses, many=True).data
        
        return Response({"courses": serialized_courses}, status=status.HTTP_200_OK)


#  ------------------------ RATING ------------------------------------

class RateCourseView(UserEnrollmentMixin, APIView):
    """Allows enrolled students to rate a course."""

    permission_classes = [IsAuthenticated]

    def _validate_rating(self, rating_value):
        """Validate the rating value."""
        if rating_value is None:
            return None, "Rating value is required."
        try:
            rating_value = int(rating_value)
            if 1 <= rating_value <= 5:
                return rating_value, None
            return None, "Rating must be an integer between 1 and 5."
        except (ValueError, TypeError):
            return None, "Rating must be an integer between 1 and 5."

    def _get_course(self, course_id):
        """Fetch course or return 404."""
        return get_object_or_404(Course, pk=course_id)

    def _check_enrollment(self, user, course):
        """Ensure the user is enrolled in the course."""
        if not self.is_student_enrolled(user, course):
            raise PermissionDenied("You must be enrolled in this course to rate it.")

    def post(self, request, course_id):
        """Create or update a rating for a course."""
        course = self._get_course(course_id)
        self._check_enrollment(request.user, course)

        rating_value, error = self._validate_rating(request.data.get('rating'))
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        _, created = Rating.objects.update_or_create(
            course=course,
            user=request.user,
            defaults={'rating': rating_value}
        )

        message = "Rating created successfully." if created else "Rating updated successfully."
        return Response({"message": message, "rating": rating_value}, status=status.HTTP_200_OK)

    def get(self, request, course_id):
        """Retrieve the user's rating for a specific course."""
        course = self._get_course(course_id)
        rating = Rating.objects.filter(course=course, user=request.user).first()

        return Response(
            {"course": course.title, "rating": rating.rating if rating else 0},
            status=status.HTTP_200_OK
        )

    

# --------------------- INVOICE GENERATION ----------------------
# PDF invoice generation libraries
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, grey
from django.http import HttpResponse
from datetime import datetime

class InvoiceDownloadView(APIView):
    """
    Generates and downloads a PDF invoice for a course.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = Course.objects.get(id=course_id)
        user = request.user
        price = 49.99

        # Setup HTTP response for PDF download
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{course.title}_{user.username}.pdf"'

        # Define custom PDF size
        width = 4 * inch
        height = 6.5 * inch
        p = canvas.Canvas(response, pagesize=(width, height))

        # Header
        p.setFillColor(HexColor("#004080"))
        p.rect(0, height - 60, width, 60, fill=True, stroke=False)
        p.setFillColor("white")
        p.setFont("Helvetica-Bold", 16)
        p.drawString(12, height - 38, "KUETx")
        p.setFont("Helvetica", 9)
        p.drawString(12, height - 52, "Where Learning Connects")

        # Title
        p.setFont("Helvetica-Bold", 12)
        p.setFillColor(black)
        p.drawString(12, height - 85, "Course Invoice")

        # Course & User Info
        y = height - 110
        p.setFont("Helvetica", 9)
        p.drawString(12, y, f"Name: {user.username}")
        y -= 14
        p.drawString(12, y, f"Email: {user.email}")
        y -= 14
        p.drawString(12, y, f"Date: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
        y -= 20

        # Section: Course Details
        p.setFont("Helvetica-Bold", 10)
        p.drawString(12, y, "Course Details")
        y -= 14
        p.setFont("Helvetica", 9)
        p.drawString(20, y, f"• Title: {course.title}")
        y -= 12
        p.drawString(20, y, f"• Subject: {course.subject}")
        y -= 12
        p.drawString(20, y, f"• Level: {course.difficulty}")
        y -= 12
        p.drawString(20, y, f"• Duration: {course.duration} hrs")
        y -= 20

        # Section: Payment
        p.setFont("Helvetica-Bold", 10)
        p.drawString(12, y, "Payment Info")
        y -= 14
        p.setFont("Helvetica", 9)
        p.drawString(20, y, f"• Price: ${price:.2f}")
        y -= 14
        p.drawString(20, y, "• Verified by Seagull")

        # Footer
        y = 50
        p.setStrokeColor(grey)
        p.setLineWidth(0.4)
        p.line(10, y + 10, width - 10, y + 10)

        p.setFont("Helvetica-Oblique", 7)
        p.setFillColor(HexColor("#004080"))
        p.drawString(12, y, "Thank you for learning with KUETx!")
        p.drawString(12, y - 10, "support@kuetx.com")

        p.showPage()
        p.save()

        return response
