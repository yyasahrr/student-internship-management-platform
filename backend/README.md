# 🐍 کارآموزیار — بک‌اند Django

بک‌اند سامانه کارآموزیار با **Django 5.2** + **Django REST Framework** + **JWT Authentication**.

## 🚀 شروع سریع

```bash
cd backend

# فعال‌سازی محیط مجازی
source venv/bin/activate

# ایجاد جداول دیتابیس
python manage.py migrate

# بارگذاری داده‌های آزمایشی
python manage.py seed

# اجرای سرور
python manage.py runserver 0.0.0.0:8000
```

## 📋 حساب‌های آزمایشی

| نقش | ایمیل | رمز عبور |
|-----|-------|----------|
| مدیر (دانشگاه) | `admin@university.ac.ir` | `admin1234` |
| دانشجو (علی) | `ali@student.ac.ir` | `student1234` |
| دانشجو (سارا) | `sara@student.ac.ir` | `student1234` |
| شرکت (دیجی‌کالا) | `hr@digikala.com` | `company1234` |
| شرکت (اسنپ) | `hr@snapp.ir` | `company1234` |

## 📡 مستندات API

### احراز هویت (`/api/auth/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| POST | `/api/auth/login/` | ورود (JWT access + refresh token) |
| POST | `/api/auth/refresh/` | تازه‌سازی توکن |
| POST | `/api/auth/register/` | ثبت‌نام کاربر جدید |
| GET | `/api/auth/me/` | اطلاعات کاربر فعلی 🔒 |

### حساب‌های کاربری (`/api/accounts/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET/PUT/PATCH | `/api/accounts/student/profile/` | پروفایل دانشجو 🔒 |
| GET/PUT/PATCH | `/api/accounts/company/profile/` | پروفایل شرکت 🔒 |
| GET | `/api/accounts/companies/` | لیست شرکت‌های تأییدشده |
| GET | `/api/accounts/companies/{id}/` | جزئیات شرکت |

### فرصت‌های کارآموزی (`/api/internships/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/internships/` | لیست فرصت‌ها + فیلتر (q, city, major) |
| GET | `/api/internships/{id}/` | جزئیات فرصت |
| GET | `/api/internships/stats/` | آمار پلتفرم |

### داشبورد شرکت (`/api/internships/company/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET/POST | `/api/internships/company/` | مدیریت فرصت‌ها 🔒 |
| GET/PUT/DELETE | `/api/internships/company/{id}/` | ویرایش فرصت 🔒 |
| POST | `/api/internships/company/{id}/close/` | بستن/فعال‌سازی فرصت 🔒 |
| GET | `/api/internships/company/{internship_id}/applications/` | متقاضیان یک فرصت 🔒 |
| PATCH | `/api/internships/company/applications/{id}/review/` | تأیید/رد درخواست 🔒 |

### داشبورد دانشجو (`/api/internships/student/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/internships/student/applications/` | درخواست‌های من 🔒 |
| POST | `/api/internships/student/apply/{internship_id}/` | ارسال درخواست 🔒 |
| DELETE | `/api/internships/student/applications/{id}/cancel/` | لغو درخواست 🔒 |

### پنل مدیریت (`/api/internships/admin/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/internships/admin/placements/` | پذیرش‌های موفق 🔒 |
| GET | `/api/internships/admin/applications/` | همه درخواست‌ها 🔒 |
| GET | `/api/internships/admin/letters/` | معرفی‌نامه‌ها 🔒 |
| GET | `/api/internships/admin/letters/{id}/` | جزئیات معرفی‌نامه 🔒 |
| POST | `/api/internships/admin/letters/issue/{application_id}/` | صدور معرفی‌نامه 🔒 |

### مدیریت شرکت‌ها (`/api/admin/`)

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/admin/companies/` | لیست شرکت‌ها 🔒 (admin) |
| POST | `/api/admin/companies/{id}/approve/` | تأیید شرکت 🔒 (admin) |
| POST | `/api/admin/companies/{id}/reject/` | رد شرکت 🔒 (admin) |

🔒 = نیازمند JWT Bearer Token در هدر `Authorization`

## 🔐 نمونه احراز هویت

```bash
# ورود
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@student.ac.ir","password":"student1234"}'

# پاسخ: { "access": "eyJ...", "refresh": "eyJ..." }

# استفاده از توکن
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer eyJ..."
```

## 🗄️ دیتابیس

به‌صورت پیش‌فرض از **SQLite** استفاده می‌شود. برای PostgreSQL، در فایل `.env`:

```env
POSTGRES_HOST=localhost
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

## 📁 ساختار پروژه

```
backend/
├── config/              # تنظیمات پروژه Django
│   ├── settings.py      # پیکربندی اصلی
│   ├── urls.py          # مسیرهای ریشه
│   └── wsgi.py
├── accounts/            # اپ حساب‌های کاربری
│   ├── models.py        # User, Student, Company
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views
│   ├── auth_urls.py     # مسیرهای احراز هویت
│   └── urls.py          # مسیرهای حساب‌ها
├── internships/         # اپ فرصت‌ها و درخواست‌ها
│   ├── models.py        # Internship, Application, Letter
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views
│   └── urls.py          # مسیرها
├── manage.py
├── requirements.txt
└── .env                 # متغیرهای محیطی
```
