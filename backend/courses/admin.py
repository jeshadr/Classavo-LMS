from django.contrib import admin
from .models import Course, Chapter, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'enrolled_students_count', 'created_at']
    list_filter = ['created_at', 'instructor']
    search_fields = ['title', 'description', 'instructor__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'visibility', 'created_at']
    list_filter = ['visibility', 'created_at', 'course']
    search_fields = ['title', 'course__title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['course', 'order']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'is_active', 'enrolled_at']
    list_filter = ['is_active', 'enrolled_at', 'course']
    search_fields = ['student__username', 'course__title']
    readonly_fields = ['enrolled_at']

