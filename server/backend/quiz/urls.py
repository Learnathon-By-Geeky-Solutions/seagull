from django.urls import path
from .views import CategoryViewSet, QuizAPIView, SubmitQuizAPIView, AddQuizView, AddQuestionView, DeleteQuizView, UpdateQuizView



urlpatterns = [
    path('', CategoryViewSet.as_view({'get': 'list'}), name='category'),
    path('<int:category_id>/', QuizAPIView.as_view(), name='quiz'),
    path('submit-quiz/', SubmitQuizAPIView.as_view(), name='submit-quiz'),
    path('add/', AddQuizView.as_view(), name='add_quiz'),
    path('add-question/', AddQuestionView.as_view(), name='add-question'),
    path('delete/', DeleteQuizView.as_view(), name='delete-quiz'),
    path('update/<int:category_id>/', UpdateQuizView.as_view(), name='update-quiz'),
]