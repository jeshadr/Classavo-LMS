# LMS Backend - Django REST Framework

This is the backend API for the Learning Management System built with Django REST Framework.

## Setup Instructions

### 1. Create a virtual environment

```bash
python -m venv venv
```

### 2. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create environment file

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Generate a secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user info
- `GET/PUT /api/auth/profile/` - Get/Update user profile

### Courses
- `GET /api/courses/courses/` - List all courses
- `POST /api/courses/courses/` - Create a course (Instructor only)
- `GET /api/courses/courses/{id}/` - Get course details
- `PUT/PATCH /api/courses/courses/{id}/` - Update course (Instructor only)
- `DELETE /api/courses/courses/{id}/` - Delete course (Instructor only)
- `GET /api/courses/courses/{id}/chapters/` - Get course chapters
- `POST /api/courses/courses/{id}/enroll/` - Enroll in course (Student only)
- `POST /api/courses/courses/{id}/unenroll/` - Unenroll from course (Student only)

### Chapters
- `GET /api/courses/chapters/` - List chapters (filtered by role)
- `POST /api/courses/chapters/` - Create a chapter (Instructor only)
- `GET /api/courses/chapters/{id}/` - Get chapter details
- `PUT/PATCH /api/courses/chapters/{id}/` - Update chapter (Instructor only)
- `DELETE /api/courses/chapters/{id}/` - Delete chapter (Instructor only)

### Enrollments
- `GET /api/courses/enrollments/` - List enrollments

## User Roles

### Instructor
- Can create and manage courses
- Can create and manage chapters
- Can set chapter visibility (public/private)
- Can view enrolled students

### Student
- Can view available courses
- Can enroll in courses
- Can view public chapters of enrolled courses
- Cannot see private chapters

## Models

### User
- Custom user model with role field (instructor/student)
- Email-based authentication
- Profile picture and bio fields

### Course
- Title, description, thumbnail
- Belongs to an instructor
- Has many chapters
- Tracks enrolled students

### Chapter
- Title, content (JSON for Plate.js), order
- Belongs to a course
- Visibility field (public/private)
- Content stored as JSON for rich text editing

### Enrollment
- Links students to courses
- Tracks enrollment date
- Active/inactive status

