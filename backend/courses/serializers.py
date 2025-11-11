from rest_framework import serializers
from .models import Course, Chapter, Enrollment
from accounts.serializers import UserSerializer


class ChapterSerializer(serializers.ModelSerializer):
    """Serializer for Chapter model"""
    
    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'content', 'order', 'visibility', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_course(self, value):
        """Ensure only the course instructor can create/update chapters"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if value.instructor != request.user:
                raise serializers.ValidationError(
                    "You can only create chapters for your own courses."
                )
        return value


class ChapterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chapters"""
    
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'content', 'order', 'visibility', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    
    instructor = UserSerializer(read_only=True)
    chapters = ChapterListSerializer(many=True, read_only=True)
    enrolled_students_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'thumbnail', 
                  'chapters', 'enrolled_students_count', 'is_enrolled',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'instructor', 'created_at', 'updated_at']
    
    def get_is_enrolled(self, obj):
        """Check if current user is enrolled in the course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_student:
            return Enrollment.objects.filter(
                student=request.user,
                course=obj,
                is_active=True
            ).exists()
        return False


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing courses"""
    
    instructor = UserSerializer(read_only=True)
    enrolled_students_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'thumbnail',
                  'enrolled_students_count', 'is_enrolled', 'created_at']
    
    def get_is_enrolled(self, obj):
        """Check if current user is enrolled in the course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_student:
            return Enrollment.objects.filter(
                student=request.user,
                course=obj,
                is_active=True
            ).exists()
        return False


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model"""
    
    student = UserSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_at', 'is_active']
        read_only_fields = ['id', 'student', 'enrolled_at']

