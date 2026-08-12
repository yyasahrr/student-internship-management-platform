from django.contrib import admin
from .models import User, Student, Company


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "full_name", "role", "city", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "city"]
    search_fields = ["email", "full_name", "username"]


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "university", "major", "grade", "student_number", "created_at"]
    list_filter = ["major", "grade", "university"]
    search_fields = ["user__email", "user__full_name", "student_number"]


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "industry", "status", "created_at"]
    list_filter = ["status", "industry"]
    search_fields = ["name", "license_number"]
