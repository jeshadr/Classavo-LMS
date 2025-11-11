from rest_framework import permissions


class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to create/edit courses.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions are only allowed to instructors
        return request.user.is_authenticated and request.user.is_instructor


class IsCourseInstructor(permissions.BasePermission):
    """
    Custom permission to only allow course instructor to edit the course.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the course instructor
        return obj.instructor == request.user


class IsChapterCourseInstructor(permissions.BasePermission):
    """
    Custom permission to only allow course instructor to edit chapters.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions: students can only see public chapters or if enrolled
        if request.method in permissions.SAFE_METHODS:
            if request.user.is_instructor and obj.course.instructor == request.user:
                return True
            
            if request.user.is_student:
                # Check if student is enrolled and chapter is public
                from .models import Enrollment
                is_enrolled = Enrollment.objects.filter(
                    student=request.user,
                    course=obj.course,
                    is_active=True
                ).exists()
                return is_enrolled and obj.visibility == 'public'
            
            return False
        
        # Write permissions are only allowed to the course instructor
        return obj.course.instructor == request.user


class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow students to perform certain actions.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student

