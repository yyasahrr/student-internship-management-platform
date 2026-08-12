"""
Management command: python manage.py seed
Seeds the database with sample data for کارآموزیار
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User, Student, Company
from internships.models import Internship, Application, Letter


class Command(BaseCommand):
    help = "Seed database with sample data for کارآموزیار"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")

        # ---- Admin (University) ----
        admin_user, created = User.objects.get_or_create(
            email="admin@university.ac.ir",
            defaults={
                "username": "admin",
                "full_name": "دکتر احمد محمدی",
                "role": User.Role.ADMIN,
                "phone": "021-12345678",
                "city": "تهران",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("admin1234")
            admin_user.save()
            self.stdout.write(f"  ✓ Admin: {admin_user.email} (also Django superuser)")
        else:
            self.stdout.write(f"  ⚠ Admin already exists: {admin_user.email}")

        # ---- Students ----
        students_data = [
            {
                "username": "ali",
                "email": "ali@student.ac.ir",
                "full_name": "علی رضایی",
                "phone": "09121234567",
                "city": "تهران",
                "university": "دانشگاه تهران",
                "major": "مهندسی کامپیوتر",
                "grade": "کارشناسی",
                "student_number": "9812001",
                "gpa": "17.5",
                "skills": ["Python", "Django", "React", "PostgreSQL"],
                "interests": "هوش مصنوعی و توسعه وب",
            },
            {
                "username": "sara",
                "email": "sara@student.ac.ir",
                "full_name": "سارا احمدی",
                "phone": "09131234567",
                "city": "اصفهان",
                "university": "دانشگاه صنعتی اصفهان",
                "major": "مهندسی برق",
                "grade": "کارشناسی ارشد",
                "student_number": "9912002",
                "gpa": "18.2",
                "skills": ["MATLAB", "Simulink", "Arduino", "C++"],
                "interests": "رباتیک و اتوماسیون",
            },
            {
                "username": "mehdi",
                "email": "mehdi@student.ac.ir",
                "full_name": "مهدی کریمی",
                "phone": "09141234567",
                "city": "تبریز",
                "university": "دانشگاه تبریز",
                "major": "مهندسی مکانیک",
                "grade": "کارشناسی",
                "student_number": "4001003",
                "gpa": "16.8",
                "skills": ["SolidWorks", "AutoCAD", "CATIA"],
                "interests": "طراحی صنعتی و CAD/CAM",
            },
            {
                "username": "fatemeh",
                "email": "fatemeh@student.ac.ir",
                "full_name": "فاطمه حسینی",
                "phone": "09151234567",
                "city": "مشهد",
                "university": "دانشگاه فردوسی مشهد",
                "major": "مهندسی کامپیوتر",
                "grade": "کارشناسی ارشد",
                "student_number": "9912004",
                "gpa": "18.9",
                "skills": ["Python", "TensorFlow", "Keras", "NLP", "Computer Vision"],
                "interests": "یادگیری عمیق و پردازش تصویر",
            },
        ]

        students = []
        for data in students_data:
            user = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password="student1234",
                full_name=data["full_name"],
                role=User.Role.STUDENT,
                phone=data["phone"],
                city=data["city"],
            )
            student = Student.objects.create(
                user=user,
                university=data["university"],
                major=data["major"],
                grade=data["grade"],
                student_number=data["student_number"],
                gpa=data["gpa"],
                skills=data["skills"],
                interests=data["interests"],
            )
            students.append(student)
            self.stdout.write(f"  ✓ Student: {user.email}")

        # ---- Companies ----
        companies_data = [
            {
                "username": "digikala",
                "email": "hr@digikala.com",
                "full_name": "محمد نوری",
                "name": "دیجی‌کالا",
                "industry": "تجارت الکترونیک",
                "description": "بزرگ‌ترین فروشگاه اینترنتی ایران",
                "address": "تهران، خیابان ولیعصر",
                "website": "https://www.digikala.com",
                "contact_phone": "021-91000123",
                "license_number": "12345678",
                "status": Company.Status.APPROVED,
            },
            {
                "username": "snapp",
                "email": "hr@snapp.ir",
                "full_name": "زهرا رحیمی",
                "name": "اسنپ",
                "industry": "فناوری اطلاعات",
                "description": "سرویس حمل و نقل هوشمند",
                "address": "تهران، میدان ونک",
                "website": "https://www.snapp.ir",
                "contact_phone": "021-91000456",
                "license_number": "23456789",
                "status": Company.Status.APPROVED,
            },
            {
                "username": "mapna",
                "email": "hr@mapnagroup.com",
                "full_name": "رضا کاظمی",
                "name": "گروه مپنا",
                "industry": "انرژی و صنعت",
                "description": "شرکت مدیریت پروژه‌های نیروگاهی ایران",
                "address": "تهران، شهرک غرب",
                "website": "https://www.mapnagroup.com",
                "contact_phone": "021-88097000",
                "license_number": "34567890",
                "status": Company.Status.APPROVED,
            },
            {
                "username": "kaveh",
                "email": "hr@kavehsteel.com",
                "full_name": "حسن مرادی",
                "name": "فولاد کاوه جنوب",
                "industry": "صنایع فلزی",
                "description": "تولیدکننده فولاد و مقاطع فلزی",
                "address": "بندرعباس، شهرک صنعتی",
                "website": "https://www.kavehsteel.com",
                "contact_phone": "076-33551234",
                "license_number": "45678901",
                "status": Company.Status.PENDING,
            },
        ]

        companies = []
        for data in companies_data:
            user = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password="company1234",
                full_name=data["full_name"],
                role=User.Role.COMPANY,
                phone=data["contact_phone"],
                city="تهران",
            )
            company = Company.objects.create(
                user=user,
                name=data["name"],
                industry=data["industry"],
                description=data["description"],
                address=data["address"],
                website=data["website"],
                contact_phone=data["contact_phone"],
                license_number=data["license_number"],
                status=data["status"],
            )
            companies.append(company)
            self.stdout.write(f"  ✓ Company: {company.name} ({company.status})")

        # ---- Internships ----
        internships_data = [
            {
                "company": companies[0],
                "title": "کارآموز توسعه بک‌اند (Python/Django)",
                "description": "فرصت کارآموزی ۳ ماهه در تیم بک‌اند دیجی‌کالا با تمرکز بر توسعه API‌های RESTful و کار با Django.",
                "capacity": 3,
                "required_skills": ["Python", "Django", "REST API", "PostgreSQL"],
                "city": "تهران",
                "major": "مهندسی کامپیوتر",
                "start_date": "2026-09-01",
                "end_date": "2026-12-01",
                "conditions": "حضور حداقل ۳ روز در هفته، بیمه تکمیلی، ناهار رایگان",
            },
            {
                "company": companies[0],
                "title": "کارآموز فرانت‌اند (React)",
                "description": "پیوستن به تیم فرانت‌اند برای توسعه رابط کاربری اپلیکیشن‌های وب.",
                "capacity": 2,
                "required_skills": ["React", "JavaScript", "TypeScript", "HTML/CSS"],
                "city": "تهران",
                "major": "مهندسی کامپیوتر",
                "start_date": "2026-09-15",
                "end_date": "2026-12-15",
                "conditions": "دورکاری امکان‌پذیر، حقوق کارآموزی",
            },
            {
                "company": companies[1],
                "title": "کارآموز علم داده و تحلیل",
                "description": "تحلیل داده‌های رفتار کاربران و مدل‌سازی پیش‌بینی تقاضا.",
                "capacity": 2,
                "required_skills": ["Python", "Pandas", "SQL", "Machine Learning"],
                "city": "تهران",
                "major": "مهندسی کامپیوتر",
                "start_date": "2026-10-01",
                "end_date": "2027-01-01",
                "conditions": "حضور ۴ روز در هفته، حقوق رقابتی",
            },
            {
                "company": companies[1],
                "title": "کارآموز مهندسی برق — سیستم‌های الکترونیکی",
                "description": "همکاری در طراحی و تست بردهای الکترونیکی برای سیستم ناوبری.",
                "capacity": 1,
                "required_skills": ["الکترونیک دیجیتال", "PCB Design", "Arduino"],
                "city": "تهران",
                "major": "مهندسی برق",
                "start_date": "2026-09-01",
                "end_date": "2026-12-01",
                "conditions": "تمام‌وقت، حقوق ماهانه",
            },
            {
                "company": companies[2],
                "title": "کارآموز مهندسی مکانیک — طراحی",
                "description": "کارآموزی در واحد طراحی مپنا با کار بر روی پروژه‌های نیروگاهی.",
                "capacity": 4,
                "required_skills": ["SolidWorks", "AutoCAD", "ترمودینامیک"],
                "city": "تهران",
                "major": "مهندسی مکانیک",
                "start_date": "2026-09-01",
                "end_date": "2027-02-01",
                "conditions": "بیمه، ناهار، سرویس رفت و آمد",
            },
        ]

        internships = []
        for data in internships_data:
            internship = Internship.objects.create(
                company=data["company"],
                title=data["title"],
                description=data["description"],
                capacity=data["capacity"],
                required_skills=data["required_skills"],
                city=data["city"],
                major=data["major"],
                start_date=data["start_date"],
                end_date=data["end_date"],
                conditions=data["conditions"],
            )
            internships.append(internship)
            self.stdout.write(f"  ✓ Internship: {internship.title}")

        # ---- Applications ----
        applications_data = [
            {"student": students[0], "internship": internships[0], "status": Application.Status.ACCEPTED, "cover_letter": "علاقه‌مند به یادگیری Django و توسعه بک‌اند هستم."},
            {"student": students[0], "internship": internships[2], "status": Application.Status.PENDING, "cover_letter": "تجربه کار با Python و Pandas دارم."},
            {"student": students[1], "internship": internships[3], "status": Application.Status.ACCEPTED, "cover_letter": "در زمینه الکترونیک دیجیتال تجربه عملی دارم."},
            {"student": students[2], "internship": internships[4], "status": Application.Status.ACCEPTED, "cover_letter": "علاقه‌مند به طراحی صنعتی هستم و با SolidWorks کار کرده‌ام."},
            {"student": students[3], "internship": internships[0], "status": Application.Status.PENDING, "cover_letter": "تجربه با Django و REST API دارم."},
            {"student": students[3], "internship": internships[2], "status": Application.Status.REJECTED, "cover_letter": "مهارت‌های ML و تحلیل داده دارم."},
        ]

        applications = []
        for data in applications_data:
            app = Application.objects.create(
                student=data["student"],
                internship=data["internship"],
                status=data["status"],
                cover_letter=data["cover_letter"],
            )
            applications.append(app)
            self.stdout.write(f"  ✓ Application: {app.student.user.full_name} → {app.internship.title} ({app.status})")

        # ---- Letters (for accepted applications) ----
        accepted_apps = [a for a in applications if a.status == Application.Status.ACCEPTED]
        for i, app in enumerate(accepted_apps):
            serial = f"MN-1404-{str(i + 1).zfill(4)}"
            Letter.objects.create(
                student=app.student,
                internship=app.internship,
                application=app,
                serial_no=serial,
                university=app.student.university or "دانشگاه",
                student_name=app.student.user.full_name,
                student_number=app.student.student_number or "",
                student_major=app.student.major or "",
                student_grade=app.student.grade or "",
                company_name=app.internship.company.name,
                internship_title=app.internship.title,
                start_date=str(app.internship.start_date or ""),
                end_date=str(app.internship.end_date or ""),
            )
            self.stdout.write(f"  ✓ Letter: {serial}")

        self.stdout.write(self.style.SUCCESS("\n🎉 Database seeded successfully!"))
        self.stdout.write("\n📋 Test Accounts:")
        self.stdout.write("  Admin:    admin@university.ac.ir / admin1234")
        self.stdout.write("  Students: ali@student.ac.ir / student1234")
        self.stdout.write("            sara@student.ac.ir / student1234")
        self.stdout.write("  Companies: hr@digikala.com / company1234")
        self.stdout.write("             hr@snapp.ir / company1234")
