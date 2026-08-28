# Karamoozyar Django API

Production-oriented Django 5.2 API for the student internship platform.

## Local development

```bash
python -m venv venv
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

SQLite is used when no PostgreSQL environment variables are configured. No demo
or seed accounts are created automatically.

## Production

Copy `.env.example` to `.env`, replace every placeholder, and run:

```bash
docker compose up --build -d
docker compose exec api python manage.py createsuperuser
```

The container runs migrations, collects static assets, and serves Django through
Gunicorn. Uploaded media must be served by object storage or a reverse proxy.

Required production values:

- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS`
- `POSTGRES_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

Health endpoint: `GET /api/`
