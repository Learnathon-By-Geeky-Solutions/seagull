from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from .models import Course, CourseContents
from .serializers import CourseSerializer, CourseContentsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

class CourseViewSet(viewsets.ReadOnlyModelViewSet):  # For listing all courses
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseDetailView(generics.RetrieveAPIView):  # For retrieving a specific course
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_course(request):
#     serializer = CourseSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_content(request, id):
#     content = get_object_or_404(CourseContents, id=id)
    
#     serializer = CourseContentsSerializer(content, data=request.data, partial=True)
    
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handle POST request to create a new course.
        """
        serializer = CourseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateContentView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        """
        Handle PUT request to update existing course content.
        """
        content = get_object_or_404(CourseContents, id=id)

        serializer = CourseContentsSerializer(content, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)