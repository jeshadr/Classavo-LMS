# Learning Management System (LMS)

A full-stack Learning Management System built with Django REST Framework (backend) and Next.js (frontend), featuring role-based access control for instructors and students.

## 🚀 Features

### Core Functionality
- **Role-Based Authentication**: Separate interfaces for instructors and students
- **Course Management**: Create, edit, and delete courses
- **Chapter Management**: Organize course content into chapters with ordering
- **Rich Text Editor**: Plate.js integration for creating formatted content
- **Visibility Control**: Set chapters as public or private
- **Enrollment System**: Students can enroll in and unenroll from courses
- **Responsive Design**: Modern, mobile-friendly UI

### Instructor Capabilities
- ✅ Create and manage courses
- ✅ Create chapters within courses
- ✅ Use Plate.js as the text editor for chapter content
- ✅ Set visibility of each chapter (public/private)
- ✅ View enrolled student count
- ✅ Organize chapters with custom ordering

### Student Capabilities
- ✅ View list of available courses
- ✅ Join courses created by instructors
- ✅ Access and read public chapters
- ✅ Search and filter courses
- ✅ View enrolled courses in dashboard

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development) - easily configurable for PostgreSQL/MySQL
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Rich Text Editor**: Plate.js (v31)
- **HTTP Client**: Axios
- **State Management**: React Context API
