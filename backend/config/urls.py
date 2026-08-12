"""
URL configuration for کارآموزیار (Karamoozyar) backend
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    """API health check & endpoint listing."""
    return JsonResponse({
        "name": "کارآموزیار API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "auth": "/api/auth/",
            "accounts": "/api/accounts/",
            "internships": "/api/internships/",
            "admin": "/api/admin/",
        },
    })


urlpatterns = [
    path("api/", api_root, name="api-root"),
    path("api/auth/", include("accounts.auth_urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/internships/", include("internships.urls")),
    path("django-admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
