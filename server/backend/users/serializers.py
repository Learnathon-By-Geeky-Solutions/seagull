from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Instructor, Student

User = get_user_model()

class InstructorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.username', read_only=True)  # Get name from User model

    class Meta:
        model = Instructor
        fields = ['id', 'name', 'designation', 'university']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'bio']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True)  # Explicitly add role

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'bio']

    def create(self, validated_data):
        role = validated_data.pop('role', None)
        user = User.objects.create_user(**validated_data)
        
        # Explicitly set the role
        if role:
            user.role = role
            user.save()  # Save after setting the role

        # Create student/instructor profile
        if role == 'instructor':
            Instructor.objects.create(user=user)
        elif role == 'student':
            Student.objects.create(user=user)

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = User.objects.filter(username=data['username']).first()
        if user and user.check_password(data['password']):
            refresh = RefreshToken.for_user(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
        raise serializers.ValidationError("Invalid credentials")
