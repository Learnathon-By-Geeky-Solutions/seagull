# Generated by Django 5.1.4 on 2025-02-10 08:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0004_alter_rating_unique_together_alter_course_ratings_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="coursecontents",
            name="text_content",
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name="rating",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
