# کارآموزیار

سامانه مدیریت کارآموزی با Next.js 16 و Django 5.2.

## اجرا در محیط توسعه

فرانت‌اند:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

بک‌اند:

```bash
cd backend
python -m venv venv
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

آدرس‌ها:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/django-admin/`

پروژه هیچ داده یا حساب نمایشی را خودکار ایجاد نمی‌کند.

## استقرار

فرانت‌اند را با متغیرهای `.env.example` روی یک سرویس سازگار با Next.js مستقر
کنید. بک‌اند از Docker Compose داخل پوشه `backend` قابل استقرار است؛ مقادیر
`.env.example` باید با secretهای واقعی و دامنه‌های production جایگزین شوند.

قبل از انتشار:

```bash
npm run lint
npm run typecheck
npm run build
cd backend
python manage.py check --deploy
python manage.py test
```
