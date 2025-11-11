from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Chapter, Enrollment
from .serializers import (
    CourseSerializer, CourseListSerializer,
    ChapterSerializer, ChapterListSerializer,
    EnrollmentSerializer
)
from .permissions import (
    IsInstructorOrReadOnly, IsCourseInstructor,
    IsChapterCourseInstructor, IsStudent
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course CRUD operations
    """
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer
    
    def get_queryset(self):
        """
        Filter courses based on user role
        Instructors see their own courses
        Students see all available courses
        """
        user = self.request.user
        if user.is_instructor:
            # Instructors see all courses but can only edit their own
            return Course.objects.all()
        elif user.is_student:
            # Students see all courses
            return Course.objects.all()
        return Course.objects.none()
    
    def perform_create(self, serializer):
        """Set the instructor as the current user"""
        serializer.save(instructor=self.request.user)
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCourseInstructor()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """Get all chapters for a course"""
        course = self.get_object()
        user = request.user
        
        chapters = course.chapters.all()
        
        # Filter chapters based on user role
        if user.is_student:
            # Check if student is enrolled
            is_enrolled = Enrollment.objects.filter(
                student=user,
                course=course,
                is_active=True
            ).exists()
            
            if is_enrolled:
                # Show only public chapters
                chapters = chapters.filter(visibility='public')
            else:
                return Response(
                    {'detail': 'You must be enrolled to view chapters.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ChapterListSerializer(chapters, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def enroll(self, request, pk=None):
        """Enroll a student in a course"""
        course = self.get_object()
        student = request.user
        
        # Check if already enrolled
        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course=course,
            defaults={'is_active': True}
        )
        
        if not created:
            if enrollment.is_active:
                return Response(
                    {'detail': 'You are already enrolled in this course.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Re-activate enrollment
                enrollment.is_active = True
                enrollment.save()
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def unenroll(self, request, pk=None):
        """Unenroll a student from a course"""
        course = self.get_object()
        student = request.user
        
        try:
            enrollment = Enrollment.objects.get(
                student=student,
                course=course
            )
            enrollment.is_active = False
            enrollment.save()
            return Response(
                {'detail': 'Successfully unenrolled from the course.'},
                status=status.HTTP_200_OK
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'detail': 'You are not enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChapterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Chapter CRUD operations
    """
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter chapters based on user role and enrollment
        """
        user = self.request.user
        
        if user.is_instructor:
            # Instructors see chapters for their own courses
            return Chapter.objects.filter(course__instructor=user)
        elif user.is_student:
            # Students see public chapters from enrolled courses
            enrolled_courses = Enrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('course_id', flat=True)
            
            return Chapter.objects.filter(
                course_id__in=enrolled_courses,
                visibility='public'
            )
        
        return Chapter.objects.none()
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            return [permissions.IsAuthenticated(), IsChapterCourseInstructor()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create a chapter"""
        serializer.save()


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing enrollments
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return enrollments based on user role
        """
        user = self.request.user
        
        if user.is_student:
            return Enrollment.objects.filter(student=user, is_active=True)
        elif user.is_instructor:
            # Instructors see enrollments for their courses
            return Enrollment.objects.filter(
                course__instructor=user,
                is_active=True
            )
        
        return Enrollment.objects.none()

