"""
Custom User model + Student & Company profiles for کارآموزیار
Mirrors the existing Drizzle schema (users, students, companies)
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with three roles:
    - student: دانشجو
    - company: نماینده شرکت/کارخانه
    - admin: مدیر سیستم (نماینده دانشگاه)
    """

    class Role(models.TextChoices):
        STUDENT = "student", "دانشجو"
        COMPANY = "company", "نماینده شرکت"
        ADMIN = "admin", "مدیر سیستم"

    email = models.EmailField("ایمیل", unique=True)
    role = models.CharField(
        "نقش",
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    phone = models.CharField("شماره تلفن", max_length=20, blank=True, null=True)
    city = models.CharField("شهر", max_length=100, blank=True, null=True)

    # Django uses username for login; we keep email as the primary identifier
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "full_name"]

    full_name = models.CharField("نام و نام خانوادگی", max_length=255, default="")

    class Meta:
        db_table = "accounts_user"
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    @property
    def name(self):
        return self.full_name or self.username


class Student(models.Model):
    """
    Student profile — اطلاعات تحصیلی، رزومه، مهارت‌ها و علاقه‌مندی‌ها
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
        verbose_name="کاربر",
    )
    university = models.CharField("دانشگاه", max_length=255, blank=True, null=True)
    major = models.CharField("رشته تحصیلی", max_length=255, blank=True, null=True)
    grade = models.CharField("مقطع تحصیلی", max_length=100, blank=True, null=True)
    student_number = models.CharField(
        "شماره دانشجویی", max_length=50, blank=True, null=True
    )
    gpa = models.CharField("معدل", max_length=10, blank=True, null=True)
    skills = models.JSONField("مهارت‌ها", default=list, blank=True)
    interests = models.TextField("علاقه‌مندی‌ها", blank=True, null=True)
    about = models.TextField("درباره من", blank=True, null=True)
    resume = models.FileField(
        "فایل رزومه", upload_to="resumes/", blank=True, null=True
    )
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("تاریخ بروزرسانی", auto_now=True)

    class Meta:
        db_table = "accounts_student"
        verbose_name = "پروفایل دانشجو"
        verbose_name_plural = "پروفایل‌های دانشجویان"

    def __str__(self):
        return f"{self.user.full_name} — {self.major or 'بدون رشته'}"

    @property
    def profile_complete(self):
        return bool(self.university and self.major and self.student_number)


class Company(models.Model):
    """
    Company profile — اطلاعات هویتی شرکت، حوزه فعالیت، آدرس و تماس
    """

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار بررسی"
        APPROVED = "approved", "تأیید شده"
        REJECTED = "rejected", "رد شده"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="company_profile",
        verbose_name="کاربر",
    )
    name = models.CharField("نام شرکت", max_length=255)
    industry = models.CharField("حوزه فعالیت", max_length=255, blank=True, null=True)
    description = models.TextField("توضیحات", blank=True, null=True)
    address = models.TextField("آدرس", blank=True, null=True)
    website = models.URLField("وب‌سایت", blank=True, null=True)
    contact_phone = models.CharField(
        "شماره تماس شرکت", max_length=20, blank=True, null=True
    )
    license_number = models.CharField(
        "شماره مجوز/ثبت", max_length=100, blank=True, null=True
    )
    logo = models.ImageField("لوگو", upload_to="company_logos/", blank=True, null=True)
    status = models.CharField(
        "وضعیت اعتبار",
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("تاریخ بروزرسانی", auto_now=True)

    class Meta:
        db_table = "accounts_company"
        verbose_name = "پروفایل شرکت"
        verbose_name_plural = "پروفایل‌های شرکت‌ها"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

    @property
    def is_approved(self):
        return self.status == self.Status.APPROVED
