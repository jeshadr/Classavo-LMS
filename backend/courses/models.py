from django.db import models
from django.conf import settings


class Course(models.Model):
    """Course model"""
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='courses_taught',
        limit_choices_to={'role': 'instructor'}
    )
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def enrolled_students_count(self):
        return self.enrollments.filter(is_active=True).count()


class Chapter(models.Model):
    """Chapter model with Plate.js content"""
    
    VISIBILITY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    content = models.JSONField(default=dict, blank=True)  # Stores Plate.js editor content
    order = models.IntegerField(default=0)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='private')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['course', 'order', 'created_at']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """Enrollment model for students joining courses"""
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-enrolled_at']
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

