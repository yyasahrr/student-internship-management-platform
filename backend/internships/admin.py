from django.contrib import admin
from .models import Internship, Application, Letter


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "company", "city", "major", "capacity", "status", "created_at"]
    list_filter = ["status", "city", "major"]
    search_fields = ["title", "description", "company__name"]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "student", "internship", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["student__user__full_name", "internship__title"]


@admin.register(Letter)
class LetterAdmin(admin.ModelAdmin):
    list_display = ["id", "serial_no", "student_name", "company_name", "internship_title", "issued_at"]
    search_fields = ["serial_no", "student_name", "company_name"]
