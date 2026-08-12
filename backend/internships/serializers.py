"""
Serializers for internships app
"""

from rest_framework import serializers
from .models import Internship, Application, Letter
from accounts.models import Company
from accounts.serializers import StudentSerializer, CompanySerializer


# --------------------------------------------------------------------------- #
# Internship
# --------------------------------------------------------------------------- #

class InternshipListSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    accepted_count = serializers.IntegerField(read_only=True)
    remaining_capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Internship
        fields = [
            "id", "company", "title", "description", "capacity",
            "required_skills", "city", "major", "start_date", "end_date",
            "status", "accepted_count", "remaining_capacity", "created_at",
        ]


class InternshipDetailSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    accepted_count = serializers.IntegerField(read_only=True)
    remaining_capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Internship
        fields = [
            "id", "company", "title", "description", "capacity",
            "required_skills", "city", "major", "start_date", "end_date",
            "conditions", "status", "accepted_count", "remaining_capacity",
            "created_at", "updated_at",
        ]


class InternshipCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = [
            "title", "description", "capacity", "required_skills",
            "city", "major", "start_date", "end_date", "conditions",
        ]

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("ظرفیت باید حداقل ۱ نفر باشد.")
        return value


# --------------------------------------------------------------------------- #
# Application
# --------------------------------------------------------------------------- #

class ApplicationSerializer(serializers.ModelSerializer):
    internship = InternshipListSerializer(read_only=True)
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "internship", "student", "status", "cover_letter",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "internship", "student", "status", "created_at", "updated_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["cover_letter"]

    def validate(self, attrs):
        request = self.context["request"]
        internship = self.context["internship"]

        # Check if already applied
        if Application.objects.filter(
            internship=internship, student__user=request.user
        ).exists():
            raise serializers.ValidationError(
                "شما قبلاً برای این فرصت درخواست داده‌اید."
            )

        return attrs


class ApplicationReviewSerializer(serializers.ModelSerializer):
    """For company to accept/reject an application."""

    class Meta:
        model = Application
        fields = ["status"]

    def validate_status(self, value):
        if value not in (Application.Status.ACCEPTED, Application.Status.REJECTED):
            raise serializers.ValidationError(
                "وضعیت باید accepted یا rejected باشد."
            )
        return value


# --------------------------------------------------------------------------- #
# Letter (معرفی‌نامه)
# --------------------------------------------------------------------------- #

class LetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letter
        fields = [
            "id", "serial_no", "university", "student_name", "student_number",
            "student_major", "student_grade", "company_name", "internship_title",
            "start_date", "end_date", "issued_at",
        ]
        read_only_fields = fields
