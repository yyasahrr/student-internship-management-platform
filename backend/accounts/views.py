"""
Views for accounts app: Registration, Profile management, Admin company review
"""

from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import User, Student, Company
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    StudentSerializer,
    StudentUpdateSerializer,
    CompanySerializer,
    CompanyUpdateSerializer,
    CompanyAdminSerializer,
)


# --------------------------------------------------------------------------- #
# Permissions
# --------------------------------------------------------------------------- #

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.STUDENT


class IsCompany(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.COMPANY


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN


# --------------------------------------------------------------------------- #
# Registration
# --------------------------------------------------------------------------- #

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user (student or company).
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    """
    GET /api/auth/me/
    Get current authenticated user info.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# --------------------------------------------------------------------------- #
# Student Profile
# --------------------------------------------------------------------------- #

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/accounts/student/profile/
    View and update student profile.
    """
    permission_classes = [IsStudent]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return StudentUpdateSerializer
        return StudentSerializer

    def get_object(self):
        student, _ = Student.objects.get_or_create(user=self.request.user)
        return student

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = StudentSerializer(instance, context={"request": request})
        return Response(serializer.data)


# --------------------------------------------------------------------------- #
# Company Profile
# --------------------------------------------------------------------------- #

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/accounts/company/profile/
    View and update company profile.
    """
    permission_classes = [IsCompany]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return CompanyUpdateSerializer
        return CompanySerializer

    def get_object(self):
        company, _ = Company.objects.get_or_create(
            user=self.request.user,
            defaults={"name": self.request.user.full_name},
        )
        return company

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = CompanySerializer(instance, context={"request": request})
        return Response(serializer.data)


class CompanyPublicView(generics.RetrieveAPIView):
    """
    GET /api/accounts/companies/{id}/
    Public view for a single approved company.
    """
    queryset = Company.objects.filter(status=Company.Status.APPROVED)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]


class CompanyListView(generics.ListAPIView):
    """
    GET /api/accounts/companies/
    List all approved companies.
    """
    queryset = Company.objects.filter(status=Company.Status.APPROVED)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]


# --------------------------------------------------------------------------- #
# Admin — Company Review
# --------------------------------------------------------------------------- #

class AdminCompanyViewSet(viewsets.ModelViewSet):
    """
    Admin-only: review and approve/reject companies.

    GET    /api/admin/companies/          — list all companies
    GET    /api/admin/companies/{id}/     — company detail
    POST   /api/admin/companies/{id}/approve/  — approve
    POST   /api/admin/companies/{id}/reject/   — reject
    """
    queryset = Company.objects.all().select_related("user")
    serializer_class = CompanyAdminSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get", "post", "head", "options"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        company = self.get_object()
        company.status = Company.Status.APPROVED
        company.save(update_fields=["status", "updated_at"])
        return Response(
            {"detail": f"شرکت «{company.name}» با موفقیت تأیید شد.", "status": "approved"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        company = self.get_object()
        company.status = Company.Status.REJECTED
        company.save(update_fields=["status", "updated_at"])
        return Response(
            {"detail": f"شرکت «{company.name}» رد شد.", "status": "rejected"},
            status=status.HTTP_200_OK,
        )
