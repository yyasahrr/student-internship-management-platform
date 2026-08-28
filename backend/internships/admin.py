from django.contrib import admin
from django.utils.html import format_html

from accounts.admin import status_badge
from .models import Internship, Application, Letter


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "company", "city", "major", "capacity_progress", "status_colored", "created_at"]
    list_filter = ["status", "city", "major", "created_at"]
    search_fields = ["title", "description", "company__name", "required_skills"]
    autocomplete_fields = ["company"]
    readonly_fields = ["created_at", "updated_at", "accepted_count", "remaining_capacity"]
    list_select_related = ["company"]
    date_hierarchy = "created_at"
    list_per_page = 25

    @admin.display(description="ظرفیت")
    def capacity_progress(self, obj):
        return format_html('<strong>{}</strong> / {} <small style="color:#64748b">پذیرفته</small>', obj.accepted_count, obj.capacity)

    @admin.display(description="وضعیت", ordering="status")
    def status_colored(self, obj):
        return status_badge(obj.status, obj.get_status_display())


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "student_name", "internship", "company_name", "status_colored", "created_at"]
    list_filter = ["status", "internship__company", "created_at"]
    search_fields = ["student__user__full_name", "student__user__email", "internship__title", "internship__company__name"]
    autocomplete_fields = ["student", "internship"]
    readonly_fields = ["created_at", "updated_at"]
    list_select_related = ["student__user", "internship__company"]
    date_hierarchy = "created_at"
    list_per_page = 25

    @admin.display(description="دانشجو", ordering="student__user__full_name")
    def student_name(self, obj):
        return obj.student.user.full_name

    @admin.display(description="شرکت", ordering="internship__company__name")
    def company_name(self, obj):
        return obj.internship.company.name

    @admin.display(description="وضعیت", ordering="status")
    def status_colored(self, obj):
        return status_badge(obj.status, obj.get_status_display())


@admin.register(Letter)
class LetterAdmin(admin.ModelAdmin):
    list_display = ["serial_no", "student_name", "company_name", "internship_title", "university", "issued_at"]
    list_filter = ["university", "company_name", "issued_at"]
    search_fields = ["serial_no", "student_name", "student_number", "company_name", "internship_title"]
    autocomplete_fields = ["student", "internship", "application"]
    readonly_fields = ["issued_at"]
    date_hierarchy = "issued_at"
    list_per_page = 25
