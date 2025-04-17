# Generated by Django 5.1.8 on 2025-04-17 15:59

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("quiz", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="quizattempt",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="useranswer",
            name="attempt",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="answers",
                to="quiz.quizattempt",
            ),
        ),
        migrations.AddField(
            model_name="useranswer",
            name="question",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="quiz.question"
            ),
        ),
        migrations.AddField(
            model_name="useranswer",
            name="selected_option",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="quiz.option",
            ),
        ),
    ]
