from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import User, Student, Company


admin.site.site_header = "مدیریت کارآموزیار"
admin.site.site_title = "پنل مدیریت کارآموزیار"
admin.site.index_title = "داشبورد مدیریت سامانه"
admin.site.empty_value_display = "—"


def status_badge(value, label):
    colors = {
        "approved": ("#dcfce7", "#166534"),
        "pending": ("#fef3c7", "#92400e"),
        "rejected": ("#ffe4e6", "#be123c"),
        "active": ("#ccfbf1", "#0f766e"),
        "closed": ("#e2e8f0", "#475569"),
        "accepted": ("#dcfce7", "#166534"),
    }
    background, color = colors.get(value, ("#f1f5f9", "#475569"))
    return format_html(
        '<span class="status-badge" style="background:{};color:{}">{}</span>',
        background, color, label,
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["id", "email", "full_name", "role_badge", "city", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "is_staff", "city", "date_joined"]
    search_fields = ["email", "full_name", "username", "phone"]
    ordering = ["-date_joined"]
    list_per_page = 25
    fieldsets = BaseUserAdmin.fieldsets + (
        ("اطلاعات کارآموزیار", {"fields": ("full_name", "role", "phone", "city")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("اطلاعات کارآموزیار", {"fields": ("email", "full_name", "role", "phone", "city")}),
    )

    @admin.display(description="نقش", ordering="role")
    def role_badge(self, obj):
        colors = {"admin": ("#ede9fe", "#6d28d9"), "company": ("#e0f2fe", "#0369a1"), "student": ("#ccfbf1", "#0f766e")}
        background, color = colors.get(obj.role, ("#f1f5f9", "#475569"))
        return format_html('<span class="status-badge" style="background:{};color:{}">{}</span>', background, color, obj.get_role_display())


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["id", "student_name", "university", "major", "grade", "student_number", "profile_status", "created_at"]
    list_filter = ["major", "grade", "university", "created_at"]
    search_fields = ["user__email", "user__full_name", "student_number", "skills"]
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at", "updated_at"]
    list_select_related = ["user"]
    list_per_page = 25

    @admin.display(description="دانشجو", ordering="user__full_name")
    def student_name(self, obj):
        return obj.user.full_name

    @admin.display(description="وضعیت پروفایل", boolean=True)
    def profile_status(self, obj):
        return obj.profile_complete


@admin.action(description="تأیید شرکت‌های انتخاب‌شده")
def approve_companies(modeladmin, request, queryset):
    count = queryset.update(status=Company.Status.APPROVED)
    modeladmin.message_user(request, f"{count} شرکت تأیید شد.", messages.SUCCESS)


@admin.action(description="رد شرکت‌های انتخاب‌شده")
def reject_companies(modeladmin, request, queryset):
    count = queryset.update(status=Company.Status.REJECTED)
    modeladmin.message_user(request, f"{count} شرکت رد شد.", messages.WARNING)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "industry", "status_colored", "license_number", "internship_count", "created_at"]
    list_filter = ["status", "industry", "created_at"]
    search_fields = ["name", "license_number", "user__email", "contact_phone"]
    autocomplete_fields = ["user"]
    readonly_fields = ["created_at", "updated_at"]
    actions = [approve_companies, reject_companies]
    list_select_related = ["user"]
    list_per_page = 25

    @admin.display(description="وضعیت", ordering="status")
    def status_colored(self, obj):
        return status_badge(obj.status, obj.get_status_display())

    @admin.display(description="تعداد فرصت‌ها")
    def internship_count(self, obj):
        return obj.internships.count()
