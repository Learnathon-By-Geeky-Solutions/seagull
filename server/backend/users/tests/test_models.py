import pytest
from users.models import User, Student, Instructor
from decouple import config

@pytest.mark.django_db
class TestUserModels:

    def test_create_student_user(self):
        user = User.objects.create_user(username='student1', password=config("TEST_PASSWORD"), role='student')
        student = Student.objects.get(user=user)        
        student.course_completed = 2
        student.course_enrolled = 5
        student.save()
        assert student.user == user
        assert student.course_completed == 2
        assert student.course_enrolled == 5
        assert user.role == 'student'
        assert student.user.username == 'student1'
        assert str(student) == 'student1'

    def test_create_instructor_user(self):
        user = User.objects.create_user(username='instructor1', password=config("TEST_PASSWORD"), role='instructor')
        instructor = Instructor.objects.get(user=user)        
        instructor.designation = 'Professor'
        instructor.university = 'University of Science'
        instructor.save()
        assert instructor.user == user
        assert instructor.designation == 'Professor'
        assert instructor.university == 'University of Science'
        assert user.role == 'instructor'
        assert instructor.user.username == 'instructor1'
        assert str(instructor) == 'instructor1'

    def test_user_str_method(self):
        user = User.objects.create_user(username='testuser', password=config("TEST_PASSWORD"), role='student')        
        assert str(user) == 'testuser'
