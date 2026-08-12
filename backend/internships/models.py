"""
Models for internships app: Internship, Application, Letter
Mirrors the existing Drizzle schema
"""

from django.db import models
from django.conf import settings

from accounts.models import Student, Company


class Internship(models.Model):
    """
    فرصت کارآموزی — ثبت‌شده توسط شرکت‌ها
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "فعال"
        CLOSED = "closed", "بسته شده"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="internships",
        verbose_name="شرکت",
    )
    title = models.CharField("عنوان موقعیت", max_length=255)
    description = models.TextField("توضیحات", blank=True, null=True)
    capacity = models.PositiveIntegerField("ظرفیت پذیرش", default=1)
    required_skills = models.JSONField("مهارت‌های مورد نیاز", default=list, blank=True)
    city = models.CharField("شهر", max_length=100, blank=True, null=True)
    major = models.CharField("رشته تحصیلی", max_length=255, blank=True, null=True)
    start_date = models.DateField("تاریخ شروع", blank=True, null=True)
    end_date = models.DateField("تاریخ پایان", blank=True, null=True)
    conditions = models.TextField("شرایط کاری", blank=True, null=True)
    status = models.CharField(
        "وضعیت",
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("تاریخ بروزرسانی", auto_now=True)

    class Meta:
        db_table = "internships_internship"
        verbose_name = "فرصت کارآموزی"
        verbose_name_plural = "فرصت‌های کارآموزی"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.company.name}"

    @property
    def accepted_count(self):
        return self.applications.filter(status=Application.Status.ACCEPTED).count()

    @property
    def remaining_capacity(self):
        return max(0, self.capacity - self.accepted_count)


class Application(models.Model):
    """
    درخواست کارآموزی — ارسال‌شده توسط دانشجویان
    """

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار بررسی"
        ACCEPTED = "accepted", "پذیرفته شده"
        REJECTED = "rejected", "رد شده"

    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="فرصت کارآموزی",
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="دانشجو",
    )
    status = models.CharField(
        "وضعیت",
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    cover_letter = models.TextField("نامه درخواست", blank=True, null=True)
    created_at = models.DateTimeField("تاریخ ارسال", auto_now_add=True)
    updated_at = models.DateTimeField("تاریخ بروزرسانی", auto_now=True)

    class Meta:
        db_table = "internships_application"
        verbose_name = "درخواست کارآموزی"
        verbose_name_plural = "درخواست‌های کارآموزی"
        unique_together = ["internship", "student"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.user.full_name} → {self.internship.title}"


class Letter(models.Model):
    """
    معرفی‌نامه — صادرشده توسط دانشگاه برای پذیرش‌های نهایی
    """

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="letters",
        verbose_name="دانشجو",
    )
    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name="letters",
        verbose_name="فرصت کارآموزی",
    )
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="letter",
        verbose_name="درخواست",
    )
    serial_no = models.CharField("شماره سریال", max_length=50, unique=True)
    university = models.CharField("نام دانشگاه", max_length=255, blank=True)
    student_name = models.CharField("نام دانشجو", max_length=255)
    student_number = models.CharField("شماره دانشجویی", max_length=50, blank=True)
    student_major = models.CharField("رشته تحصیلی", max_length=255, blank=True)
    student_grade = models.CharField("مقطع تحصیلی", max_length=100, blank=True)
    company_name = models.CharField("نام شرکت", max_length=255)
    internship_title = models.CharField("عنوان کارآموزی", max_length=255)
    start_date = models.CharField("تاریخ شروع", max_length=20, blank=True)
    end_date = models.CharField("تاریخ پایان", max_length=20, blank=True)
    issued_at = models.DateTimeField("تاریخ صدور", auto_now_add=True)

    class Meta:
        db_table = "internships_letter"
        verbose_name = "معرفی‌نامه"
        verbose_name_plural = "معرفی‌نامه‌ها"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.serial_no} — {self.student_name} → {self.company_name}"
