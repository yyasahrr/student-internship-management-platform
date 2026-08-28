"""Admin-only account management endpoints."""

from rest_framework.routers import DefaultRouter

from .views import AdminCompanyViewSet


router = DefaultRouter()
router.register(r"companies", AdminCompanyViewSet, basename="admin-company")

urlpatterns = router.urls
