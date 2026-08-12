"""
URL configuration for internships app.
Mounted at /api/internships/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InternshipListView,
    InternshipDetailView,
    CompanyInternshipViewSet,
    CompanyApplicationListView,
    CompanyApplicationReviewView,
    StudentApplicationListView,
    StudentApplyView,
    StudentCancelApplicationView,
    AdminPlacementListView,
    AdminAllApplicationsView,
    AdminIssueLetterView,
    AdminLetterListView,
    AdminLetterDetailView,
    StatsView,
)

router = DefaultRouter()
router.register(r"company", CompanyInternshipViewSet, basename="company-internship")

urlpatterns = [
    # Public endpoints
    path("", InternshipListView.as_view(), name="internship-list"),
    path("stats/", StatsView.as_view(), name="stats"),
    path("<int:pk>/", InternshipDetailView.as_view(), name="internship-detail"),

    # Company endpoints
    path(
        "company/<int:internship_id>/applications/",
        CompanyApplicationListView.as_view(),
        name="company-internship-applications",
    ),
    path(
        "company/applications/<int:pk>/review/",
        CompanyApplicationReviewView.as_view(),
        name="company-application-review",
    ),

    # Student endpoints
    path(
        "student/applications/",
        StudentApplicationListView.as_view(),
        name="student-applications",
    ),
    path(
        "student/apply/<int:internship_id>/",
        StudentApplyView.as_view(),
        name="student-apply",
    ),
    path(
        "student/applications/<int:pk>/cancel/",
        StudentCancelApplicationView.as_view(),
        name="student-cancel-application",
    ),

    # Admin endpoints
    path("admin/placements/", AdminPlacementListView.as_view(), name="admin-placements"),
    path("admin/applications/", AdminAllApplicationsView.as_view(), name="admin-applications"),
    path("admin/letters/", AdminLetterListView.as_view(), name="admin-letters"),
    path("admin/letters/<int:pk>/", AdminLetterDetailView.as_view(), name="admin-letter-detail"),
    path(
        "admin/letters/issue/<int:application_id>/",
        AdminIssueLetterView.as_view(),
        name="admin-issue-letter",
    ),
]

urlpatterns += router.urls
