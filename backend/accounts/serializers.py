"""
Serializers for accounts app: User registration, profiles (Student, Company)
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Student, Company


class UserSerializer(serializers.ModelSerializer):
    """Read-only user info."""

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "role", "phone", "city", "date_joined",
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """Register a new user (student or company representative)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "username", "full_name", "password", "password_confirm",
            "role", "phone", "city",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "رمز عبور و تکرار آن مطابقت ندارند."}
            )
        # Admin role cannot be self-registered
        if attrs.get("role") == User.Role.ADMIN:
            raise serializers.ValidationError(
                {"role": "ثبت‌نام با نقش مدیر سیستم امکان‌پذیر نیست."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Auto-create profile
        if user.role == User.Role.STUDENT:
            Student.objects.create(user=user)
        elif user.role == User.Role.COMPANY:
            Company.objects.create(user=user, name=user.full_name)

        return user


# --------------------------------------------------------------------------- #
# Student Profile
# --------------------------------------------------------------------------- #

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            "id", "user", "university", "major", "grade", "student_number",
            "gpa", "skills", "interests", "about", "resume", "profile_complete",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "profile_complete", "created_at", "updated_at"]


class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "university", "major", "grade", "student_number",
            "gpa", "skills", "interests", "about", "resume",
        ]


# --------------------------------------------------------------------------- #
# Company Profile
# --------------------------------------------------------------------------- #

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            "id", "user", "name", "industry", "description", "address",
            "website", "contact_phone", "license_number", "logo", "status",
            "is_approved", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "status", "is_approved", "created_at", "updated_at"]


class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "name", "industry", "description", "address",
            "website", "contact_phone", "license_number", "logo",
        ]


class CompanyAdminSerializer(serializers.ModelSerializer):
    """Admin-only serializer for approving/rejecting companies."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            "id", "user", "name", "industry", "description", "address",
            "website", "contact_phone", "license_number", "logo", "status",
            "is_approved", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "user", "name", "industry", "description", "address",
            "website", "contact_phone", "license_number", "logo",
            "is_approved", "created_at", "updated_at",
        ]
