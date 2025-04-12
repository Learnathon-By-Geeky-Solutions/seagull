from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Course, CourseContents, Enrollment, Rating
from .serializers import CourseSerializer, CourseContentsSerializer
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class AdminOnlyAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_course_or_404(self, course_id):
        return get_object_or_404(Course, id=course_id)


class AddCourseView(AdminOnlyAPIView):
    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateDeleteCourseView(AdminOnlyAPIView):
    def put(self, request, course_id):
        course = self.get_course_or_404(course_id)
        return self.handle_update(CourseSerializer(course, data=request.data, partial=True))

    def delete(self, request, course_id):
        course = self.get_course_or_404(course_id)
        course.delete()
        return Response({"message": "Course deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    def handle_update(self, serializer):
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseContentView(generics.ListAPIView):
    serializer_class = CourseContentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)

        if not Enrollment.objects.filter(course=course, student=user.student).exists():
            return CourseContents.objects.none()

        return CourseContents.objects.filter(course=course)

class AddContentAPIView(AdminOnlyAPIView):
    def post(self, request):
        course = self.get_course_or_404(request.data.get('course'))
        serializer = CourseContentsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateContentView(AdminOnlyAPIView):
    def put(self, request, id):
        content = get_object_or_404(CourseContents, id=id)
        serializer = CourseContentsSerializer(content, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteContentView(AdminOnlyAPIView):
    def delete(self, request, id):
        content = get_object_or_404(CourseContents, id=id)
        content.delete()
        return Response({'message': 'Content deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class EnrollCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user
        if not hasattr(user, 'student'):
            return Response({"error": "Only students can enroll in courses"}, status=403)

        course = get_object_or_404(Course, id=course_id)
        _, created = Enrollment.objects.get_or_create(course=course, student=user.student)

        return Response({"message": "Already enrolled" if not created else f"Successfully enrolled in {course.title}!"}, status=200 if created else 400)


class EnrolledCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(enrollment__student=user.student) if hasattr(user, 'student') else Course.objects.none()


class InstructorCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'instructor'):
            return Response({"error": "Only instructors can view this information."}, status=status.HTTP_403_FORBIDDEN)

        courses = Course.objects.filter(created_by=user.instructor)
        if courses.exists():
            return Response({"courses": CourseSerializer(courses, many=True).data}, status=status.HTTP_200_OK)
        return Response({"message": "No courses found for this instructor."}, status=status.HTTP_200_OK)


class RateCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        if not Enrollment.objects.filter(course=course, student__user=request.user).exists():
            return Response({"error": "You must be enrolled in this course to rate it."}, status=status.HTTP_403_FORBIDDEN)

        rating_value = request.data.get('rating')
        if rating_value is None:
            return Response({"error": "Rating value is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating_value = int(rating_value)
            if rating_value < 1 or rating_value > 5:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Rating must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        _, created = Rating.objects.update_or_create(course=course, user=request.user, defaults={'rating': rating_value})
        return Response({"message": "Rating created successfully." if created else "Rating updated successfully.", "rating": rating_value}, status=status.HTTP_200_OK)

    def get(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        rating = Rating.objects.filter(course=course, user=request.user).first()
        return Response({"course": course.title, "rating": rating.rating if rating else 0}, status=status.HTTP_200_OK)
