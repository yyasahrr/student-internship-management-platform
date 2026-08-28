"""
Views for internships app: CRUD internships, applications, letters
"""

from django.db.models import Count, Q, F
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User, Student, Company
from accounts.views import IsStudent, IsCompany, IsAdmin

from .models import Internship, Application, Letter
from .serializers import (
    InternshipListSerializer,
    InternshipDetailSerializer,
    InternshipCreateUpdateSerializer,
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationReviewSerializer,
    LetterSerializer,
)


# --------------------------------------------------------------------------- #
# Public Internship Listing & Search
# --------------------------------------------------------------------------- #

class InternshipListView(generics.ListAPIView):
    """
    GET /api/internships/
    List active internships from approved companies.
    Supports filtering: ?q=...&city=...&major=...
    """
    serializer_class = InternshipListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Internship.objects.filter(
            status=Internship.Status.ACTIVE,
            company__status=Company.Status.APPROVED,
        ).select_related("company").prefetch_related("applications")

        q = self.request.query_params.get("q", "").strip()
        city = self.request.query_params.get("city", "").strip()
        major = self.request.query_params.get("major", "").strip()

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(company__name__icontains=q)
                | Q(required_skills__icontains=q)
            )
        if city and city != "all":
            qs = qs.filter(city=city)
        if major and major != "all":
            qs = qs.filter(major=major)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Also return distinct cities and majors for filters
        cities = (
            Internship.objects.filter(status=Internship.Status.ACTIVE)
            .values_list("city", flat=True)
            .distinct()
        )
        majors = (
            Internship.objects.filter(status=Internship.Status.ACTIVE)
            .values_list("major", flat=True)
            .distinct()
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "results": serializer.data,
                "filters": {
                    "cities": sorted(set(c for c in cities if c)),
                    "majors": sorted(set(m for m in majors if m)),
                },
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "results": serializer.data,
            "filters": {
                "cities": sorted(set(c for c in cities if c)),
                "majors": sorted(set(m for m in majors if m)),
            },
        })


class InternshipDetailView(generics.RetrieveAPIView):
    """
    GET /api/internships/{id}/
    Retrieve a single internship with full details.
    """
    queryset = Internship.objects.select_related("company").prefetch_related("applications")
    serializer_class = InternshipDetailSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------------------------------------------------------- #
# Company — Internship CRUD
# --------------------------------------------------------------------------- #

class CompanyInternshipViewSet(viewsets.ModelViewSet):
    """
    Company-only: manage own internships.

    GET    /api/internships/company/           — list own internships
    POST   /api/internships/company/           — create new
    GET    /api/internships/company/{id}/      — detail
    PUT    /api/internships/company/{id}/      — update
    DELETE /api/internships/company/{id}/      — delete
    POST   /api/internships/company/{id}/close/  — close/reopen
    """
    permission_classes = [IsCompany]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return InternshipCreateUpdateSerializer
        return InternshipDetailSerializer

    def get_queryset(self):
        company = Company.objects.filter(user=self.request.user).first()
        if not company:
            return Internship.objects.none()
        return Internship.objects.filter(company=company).prefetch_related("applications")

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        if not company.is_approved:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "شرکت شما هنوز تأیید نشده است. پس از تأیید دانشگاه می‌توانید فرصت ثبت کنید."
            )
        serializer.save(company=company)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        """Toggle internship status between active and closed."""
        internship = self.get_object()
        internship.status = (
            Internship.Status.CLOSED
            if internship.status == Internship.Status.ACTIVE
            else Internship.Status.ACTIVE
        )
        internship.save(update_fields=["status", "updated_at"])
        return Response({
            "detail": f"وضعیت به «{internship.get_status_display()}» تغییر یافت.",
            "status": internship.status,
        })


# --------------------------------------------------------------------------- #
# Company — Application Review
# --------------------------------------------------------------------------- #

class CompanyApplicationListView(generics.ListAPIView):
    """
    GET /api/internships/company/{internship_id}/applications/
    List all applications for a specific internship (company only).
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsCompany]

    def get_queryset(self):
        company = Company.objects.filter(user=self.request.user).first()
        if not company:
            return Application.objects.none()
        return Application.objects.filter(
            internship__company=company,
            internship_id=self.kwargs["internship_id"],
        ).select_related(
            "student__user", "internship__company"
        )


class CompanyApplicationReviewView(generics.UpdateAPIView):
    """
    PATCH /api/internships/company/applications/{id}/
    Accept or reject an application.
    """
    serializer_class = ApplicationReviewSerializer
    permission_classes = [IsCompany]

    def get_queryset(self):
        company = Company.objects.filter(user=self.request.user).first()
        if not company:
            return Application.objects.none()
        return Application.objects.filter(
            internship__company=company,
        ).select_related("student__user", "internship__company")


# --------------------------------------------------------------------------- #
# Student — Applications
# --------------------------------------------------------------------------- #

class StudentApplicationListView(generics.ListAPIView):
    """
    GET /api/internships/student/applications/
    List all applications by the current student.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        student = Student.objects.filter(user=self.request.user).first()
        if not student:
            return Application.objects.none()
        return Application.objects.filter(student=student).select_related(
            "internship__company"
        )


class StudentApplyView(generics.CreateAPIView):
    """
    POST /api/internships/student/apply/{internship_id}/
    Submit an application for an internship.
    """
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsStudent]

    def create(self, request, *args, **kwargs):
        internship = generics.get_object_or_404(
            Internship.objects.filter(
                status=Internship.Status.ACTIVE,
                company__status=Company.Status.APPROVED,
            ),
            pk=self.kwargs["internship_id"],
        )

        student = Student.objects.filter(user=request.user).first()
        if not student:
            return Response(
                {"detail": "پروفایل دانشجویی یافت نشد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "internship": internship},
        )
        serializer.is_valid(raise_exception=True)

        application = Application.objects.create(
            internship=internship,
            student=student,
            cover_letter=serializer.validated_data.get("cover_letter", ""),
        )

        return Response(
            ApplicationSerializer(
                application, context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED,
        )


class StudentCancelApplicationView(generics.DestroyAPIView):
    """
    DELETE /api/internships/student/applications/{id}/cancel/
    Cancel a pending application.
    """
    permission_classes = [IsStudent]

    def get_queryset(self):
        student = Student.objects.filter(user=self.request.user).first()
        if not student:
            return Application.objects.none()
        return Application.objects.filter(
            student=student,
            status=Application.Status.PENDING,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"detail": "درخواست شما با موفقیت لغو شد."},
            status=status.HTTP_200_OK,
        )


# --------------------------------------------------------------------------- #
# Admin — Placements & Letters
# --------------------------------------------------------------------------- #

class AdminPlacementListView(generics.ListAPIView):
    """
    GET /api/admin/placements/
    List all accepted applications (placements).
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Application.objects.filter(
            status=Application.Status.ACCEPTED,
        ).select_related("student__user", "internship__company")


class AdminAllApplicationsView(generics.ListAPIView):
    """
    GET /api/admin/applications/
    List all applications across the platform.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Application.objects.all().select_related(
            "student__user", "internship__company"
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminIssueLetterView(generics.CreateAPIView):
    """
    POST /api/admin/letters/issue/{application_id}/
    Issue a letter for an accepted application.
    """
    permission_classes = [IsAdmin]
    serializer_class = LetterSerializer

    def create(self, request, *args, **kwargs):
        application = generics.get_object_or_404(
            Application.objects.filter(status=Application.Status.ACCEPTED),
            pk=self.kwargs["application_id"],
        )

        # Check if letter already exists
        existing = Letter.objects.filter(application=application).first()
        if existing:
            return Response(
                LetterSerializer(existing).data,
                status=status.HTTP_200_OK,
            )

        # Generate serial number
        letter_count = Letter.objects.count()
        serial_no = f"MN-1404-{str(letter_count + 1).zfill(4)}"

        letter = Letter.objects.create(
            student=application.student,
            internship=application.internship,
            application=application,
            serial_no=serial_no,
            university=application.student.university or "دانشگاه",
            student_name=application.student.user.full_name,
            student_number=application.student.student_number or "",
            student_major=application.student.major or "",
            student_grade=application.student.grade or "",
            company_name=application.internship.company.name,
            internship_title=application.internship.title,
            start_date=str(application.internship.start_date or ""),
            end_date=str(application.internship.end_date or ""),
        )

        return Response(
            LetterSerializer(letter).data,
            status=status.HTTP_201_CREATED,
        )


class AdminLetterListView(generics.ListAPIView):
    """
    GET /api/admin/letters/
    List all issued letters.
    """
    serializer_class = LetterSerializer
    permission_classes = [IsAdmin]
    queryset = Letter.objects.all()


class AdminLetterDetailView(generics.RetrieveAPIView):
    """
    GET /api/admin/letters/{id}/
    Retrieve a single letter.
    """
    serializer_class = LetterSerializer
    permission_classes = [IsAdmin]
    queryset = Letter.objects.all()


# --------------------------------------------------------------------------- #
# Dashboard Stats
# --------------------------------------------------------------------------- #

class StatsView(generics.GenericAPIView):
    """
    GET /api/stats/
    Public platform statistics.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        stats = {
            "active_internships": Internship.objects.filter(
                status=Internship.Status.ACTIVE,
                company__status=Company.Status.APPROVED,
            ).count(),
            "approved_companies": Company.objects.filter(
                status=Company.Status.APPROVED
            ).count(),
            "total_students": Student.objects.count(),
            "accepted_applications": Application.objects.filter(
                status=Application.Status.ACCEPTED
            ).count(),
            "pending_companies": Company.objects.filter(
                status=Company.Status.PENDING
            ).count(),
            "issued_letters": Letter.objects.count(),
        }
        return Response(stats)
