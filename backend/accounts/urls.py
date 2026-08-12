"""
Account-related URLs (profiles, companies).
Mounted at /api/accounts/
"""

from django.urls import path, include

from .views import (
    StudentProfileView,
    CompanyProfileView,
    CompanyListView,
    CompanyPublicView,
)

urlpatterns = [
    path("student/profile/", StudentProfileView.as_view(), name="student-profile"),
    path("company/profile/", CompanyProfileView.as_view(), name="company-profile"),
    path("companies/", CompanyListView.as_view(), name="company-list"),
    path("companies/<int:pk>/", CompanyPublicView.as_view(), name="company-detail"),
]
