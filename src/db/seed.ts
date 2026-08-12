import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  companies,
  internships,
  letters,
  students,
  users,
} from "@/db/schema";

/* ------------------------------------------------------------------ */
/* Seed — داده‌های نمونه برای سه نقش + فرصت‌ها + درخواست‌ها             */
/* Idempotent: در صورت وجود داده، چیزی تکراری نمی‌سازد                   */
/* ------------------------------------------------------------------ */

const DEMO_PASSWORD_HASH = (async () => await hash("Password@1234", 10))();

async function ensureUser(
  email: string,
  fullName: string,
  role: "student" | "company" | "admin",
  phone: string,
  city: string
) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing;
  const [row] = await db
    .insert(users)
    .values({
      email,
      fullName,
      role,
      phone,
      city,
      passwordHash: await DEMO_PASSWORD_HASH,
    })
    .returning();
  return row;
}

export async function seedDatabase() {
  const passwordHash = await DEMO_PASSWORD_HASH;

  /* ---------------------------- Admin ---------------------------- */
  const admin = await ensureUser(
    "admin@university.ac.ir",
    "مدیر سامانه دانشگاه",
    "admin",
    "021-88000000",
    "تهران"
  );

  /* -------------------------- Students --------------------------- */
  const saraUser = await ensureUser(
    "sara@student.ac.ir",
    "سارا محمدی",
    "student",
    "0912-1112233",
    "تهران"
  );
  let sara = await db.query.students.findFirst({
    where: eq(students.userId, saraUser.id),
  });
  if (!sara) {
    [sara] = await db
      .insert(students)
      .values({
        userId: saraUser.id,
        university: "دانشگاه صنعتی شریف",
        major: "مهندسی کامپیوتر",
        grade: "کارشناسی",
        studentNumber: "99120001",
        gpa: "17.8",
        skills: ["React", "TypeScript", "Node.js", "SQL"],
        interests: "توسعه فرانت‌اند و طراحی رابط کاربری",
        about:
          "دانشجوی ترم آخر مهندسی کامپیوتر با علاقه به توسعه وب و تجربه ساخت چند پروژه دانشگاهی و شخصی.",
        resumeUrl: "/resumes/sara-mohammadi.pdf",
      })
      .returning();
  }

  const aliUser = await ensureUser(
    "ali@student.ac.ir",
    "علی رضایی",
    "student",
    "0913-5556677",
    "اصفهان"
  );
  let ali = await db.query.students.findFirst({
    where: eq(students.userId, aliUser.id),
  });
  if (!ali) {
    [ali] = await db
      .insert(students)
      .values({
        userId: aliUser.id,
        university: "دانشگاه صنعتی اصفهان",
        major: "مهندسی برق",
        grade: "کارشناسی",
        studentNumber: "98070012",
        gpa: "16.2",
        skills: ["PLC", "مدارهای الکترونیکی", "AutoCAD", "MATLAB"],
        interests: "اتوماسیون صنعتی و سیستم‌های کنترل",
        about: "دانشجوی مهندسی برق قدرت، علاقه‌مند به اتوماسیون صنعتی.",
        resumeUrl: "/resumes/ali-rezaei.pdf",
      })
      .returning();
  }

  const maryamUser = await ensureUser(
    "maryam@student.ac.ir",
    "مریم احمدی",
    "student",
    "0917-8889900",
    "شیراز"
  );
  let maryam = await db.query.students.findFirst({
    where: eq(students.userId, maryamUser.id),
  });
  if (!maryam) {
    [maryam] = await db
      .insert(students)
      .values({
        userId: maryamUser.id,
        university: "دانشگاه شیراز",
        major: "مهندسی صنایع",
        grade: "کارشناسی ارشد",
        studentNumber: "97150034",
        gpa: "18.1",
        skills: ["برنامه‌ریزی تولید", "کنترل کیفیت", "Excel پیشرفته"],
        interests: "بهینه‌سازی فرآیندهای تولید",
        about: "دانشجوی ارشد مهندسی صنایع، فعال در پروژه‌های بهینه‌سازی.",
        resumeUrl: "/resumes/maryam-ahmadi.pdf",
      })
      .returning();
  }

  const hosseinUser = await ensureUser(
    "hossein@student.ac.ir",
    "حسین کریمی",
    "student",
    "0413-4455667",
    "تبریز"
  );
  let hossein = await db.query.students.findFirst({
    where: eq(students.userId, hosseinUser.id),
  });
  if (!hossein) {
    [hossein] = await db
      .insert(students)
      .values({
        userId: hosseinUser.id,
        university: "دانشگاه تبریز",
        major: "مهندسی مکانیک",
        grade: "کارشناسی",
        studentNumber: "99030123",
        gpa: "15.9",
        skills: ["SolidWorks", "ABAQUS", "مکانیک سیالات"],
        interests: "طراحی و تحلیل مکانیکی",
        about: "دانشجوی مکانیک با سابقه کارگاه‌های عملی.",
        resumeUrl: "/resumes/hossein-karimi.pdf",
      })
      .returning();
  }

  /* -------------------------- Companies -------------------------- */
  const parsUser = await ensureUser(
    "hr@parstech.ir",
    "نماینده پارس تکنولوژی",
    "company",
    "021-44001122",
    "تهران"
  );
  let pars = await db.query.companies.findFirst({
    where: eq(companies.userId, parsUser.id),
  });
  if (!pars) {
    [pars] = await db
      .insert(companies)
      .values({
        userId: parsUser.id,
        name: "شرکت پارس تکنولوژی",
        industry: "فناوری اطلاعات",
        description:
          "شرکت نرم‌افزاری فعال در حوزه توسعه وب و اپلیکیشن‌های موبایل با بیش از ۱۰ سال سابقه.",
        address: "تهران، خیابان ولیعصر، برج فناوری، طبقه ۸",
        website: "https://parstech.ir",
        contactPhone: "021-44001122",
        licenseNumber: "IT-1402-8851",
        status: "approved",
      })
      .returning();
  }

  const fooladUser = await ensureUser(
    "hr@foolad.ir",
    "نماینده فولاد کویر",
    "company",
    "031-32223344",
    "اصفهان"
  );
  let foolad = await db.query.companies.findFirst({
    where: eq(companies.userId, fooladUser.id),
  });
  if (!foolad) {
    [foolad] = await db
      .insert(companies)
      .values({
        userId: fooladUser.id,
        name: "کارخانه فولاد کویر",
        industry: "فولاد و متالورژی",
        description:
          "تولیدکننده بزرگ مقاطع فولادی در منطقه مرکزی کشور با دو خط تولید فعال.",
        address: "اصفهان، شهرک صنعتی بزرگ، خیابان فولاد، پلاک ۱۲",
        website: "https://fooladkavir.ir",
        contactPhone: "031-32223344",
        licenseNumber: "IND-1390-2214",
        status: "approved",
      })
      .returning();
  }

  const aryanUser = await ensureUser(
    "hr@aryan.ir",
    "نماینده داده‌پرداز آرین",
    "company",
    "051-37778899",
    "مشهد"
  );
  let aryan = await db.query.companies.findFirst({
    where: eq(companies.userId, aryanUser.id),
  });
  if (!aryan) {
    [aryan] = await db
      .insert(companies)
      .values({
        userId: aryanUser.id,
        name: "گروه داده‌پرداز آرین",
        industry: "فناوری اطلاعات",
        description: "شرکت ارائه‌دهنده راهکارهای داده و هوش تجاری.",
        address: "مشهد، بلوار فناوری، مجتمع نوآوری",
        website: "https://aryandata.ir",
        contactPhone: "051-37778899",
        licenseNumber: "IT-1403-9012",
        status: "pending",
      })
      .returning();
  }

  const barghUser = await ensureUser(
    "hr@bargh.ir",
    "نماینده نیروگاه برق جنوب",
    "company",
    "071-36667788",
    "شیراز"
  );
  let bargh = await db.query.companies.findFirst({
    where: eq(companies.userId, barghUser.id),
  });
  if (!bargh) {
    [bargh] = await db
      .insert(companies)
      .values({
        userId: barghUser.id,
        name: "نیروگاه برق جنوب",
        industry: "انرژی",
        description: "نیروگاه تولید برق منطقه جنوب کشور.",
        address: "شیراز، جاده صنعتی، نیروگاه سیکل ترکیبی",
        website: "https://barghjonoob.ir",
        contactPhone: "071-36667788",
        licenseNumber: "ENE-1385-4471",
        status: "approved",
      })
      .returning();
  }

  /* ------------------------- Internships ------------------------- */
  async function ensureInternship(data: {
    companyId: number;
    title: string;
    description: string;
    capacity: number;
    requiredSkills: string[];
    city: string;
    major: string;
    startDate: string;
    endDate: string;
    conditions: string;
  }) {
    const existing = await db.query.internships.findFirst({
      where: (t, { eq: e, and: a }) =>
        a(e(t.companyId, data.companyId), e(t.title, data.title)),
    });
    if (existing) return existing;
    const [row] = await db.insert(internships).values(data).returning();
    return row;
  }

  const i1 = await ensureInternship({
    companyId: pars.id,
    title: "کارآموز توسعه فرانت‌اند (React)",
    description:
      "همکاری در تیم توسعه محصول برای پیاده‌سازی رابط کاربری پروژه‌های واقعی با React و TypeScript. منتور اختصاصی در طول دوره.",
    capacity: 4,
    requiredSkills: ["React", "TypeScript", "HTML/CSS", "Git"],
    city: "تهران",
    major: "مهندسی کامپیوتر",
    startDate: "2026-03-01",
    endDate: "2026-05-30",
    conditions:
      "حضوری (۳ روز در هفته)، ساعت کاری منعطف ۹ تا ۱۵، کمکهزینه ماهانه ۵ میلیون تومان، امکان جذب پس از پایان دوره.",
  });

  const i2 = await ensureInternship({
    companyId: pars.id,
    title: "کارآموز توسعه Backend (Node.js)",
    description:
      "توسعه و نگهداری سرویس‌های سمت سرور با Node.js و PostgreSQL زیر نظر تیم فنی ارشد.",
    capacity: 2,
    requiredSkills: ["Node.js", "PostgreSQL", "REST API"],
    city: "تهران",
    major: "مهندسی کامپیوتر",
    startDate: "2026-03-15",
    endDate: "2026-06-15",
    conditions:
      "ترکیبی (حضوری/دورکاری)، کمکهزینه ماهانه ۴ میلیون تومان، تیم کوچک و صمیمی.",
  });

  const i3 = await ensureInternship({
    companyId: foolad.id,
    title: "کارآموز اتوماسیون صنعتی",
    description:
      "آشنایی عملی با سیستم‌های PLC و خطوط تولید خودکار، همکاری با واحد نگهداری و تعمیرات.",
    capacity: 3,
    requiredSkills: ["PLC", "مدارهای الکترونیکی", "AutoCAD"],
    city: "اصفهان",
    major: "مهندسی برق",
    startDate: "2026-04-01",
    endDate: "2026-07-01",
    conditions:
      "حضوری، ۸ صبح تا ۱۴، سرویس رفت‌وآمد از شهر، بیمه کارآموزی، کمکهزینه ماهانه ۳.۵ میلیون تومان.",
  });

  const i4 = await ensureInternship({
    companyId: foolad.id,
    title: "کارآموز برنامه‌ریزی تولید",
    description:
      "همکاری با واحد برنامه‌ریزی در زمان‌بندی خطوط تولید و تحلیل داده‌های عملکرد.",
    capacity: 2,
    requiredSkills: ["برنامه‌ریزی تولید", "Excel پیشرفته", "کنترل کیفیت"],
    city: "اصفهان",
    major: "مهندسی صنایع",
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    conditions: "حضوری، ۵ روز در هفته، کمکهزینه ماهانه ۳ میلیون تومان.",
  });

  const i5 = await ensureInternship({
    companyId: bargh.id,
    title: "کارآموز نگهداری و تعمیرات تجهیزات",
    description:
      "همراهی با تیم تعمیرات توربین و تجهیزات نیروگاهی، آشنایی با مستندات فنی.",
    capacity: 2,
    requiredSkills: ["SolidWorks", "مکانیک سیالات", "گزارش‌نویسی فنی"],
    city: "شیراز",
    major: "مهندسی مکانیک",
    startDate: "2026-03-20",
    endDate: "2026-06-20",
    conditions:
      "حضوری، شیفت صبح، بیمه حادثه، کمکهزینه ماهانه ۴ میلیون تومان.",
  });

  const i6 = await ensureInternship({
    companyId: bargh.id,
    title: "کارآموز کنترل کیفیت (QC)",
    description:
      "بازرسی و کنترل کیفیت قطعات و تجهیزات، تهیه گزارش‌های آزمون.",
    capacity: 1,
    requiredSkills: ["کنترل کیفیت", "MATLAB", "Excel پیشرفته"],
    city: "شیراز",
    major: "مهندسی برق",
    startDate: "2026-04-01",
    endDate: "2026-05-30",
    conditions: "حضوری، ۴ روز در هفته، کمکهزینه ماهانه ۳ میلیون تومان.",
  });

  /* ------------------------ Applications ------------------------- */
  async function ensureApplication(
    internshipId: number,
    studentId: number,
    status: "pending" | "accepted" | "rejected",
    coverLetter: string
  ) {
    const existing = await db.query.applications.findFirst({
      where: (t, { eq: e, and: a }) =>
        a(e(t.internshipId, internshipId), e(t.studentId, studentId)),
    });
    if (existing) return existing;
    const [row] = await db
      .insert(applications)
      .values({ internshipId, studentId, status, coverLetter })
      .returning();
    return row;
  }

  await ensureApplication(
    i1.id,
    sara.id,
    "accepted",
    "سلام، من دانشجوی ترم آخر مهندسی کامپیوتر هستم و تجربه عملی در React و TypeScript دارم. بسیار علاقه‌مندم که در تیم پارس تکنولوژی رشد کنم."
  );
  await ensureApplication(
    i2.id,
    sara.id,
    "pending",
    "علاقه‌مند به توسعه سمت سرور هستم و پروژه‌هایی با Node.js انجام داده‌ام."
  );
  await ensureApplication(
    i3.id,
    ali.id,
    "accepted",
    "با PLC و مدارهای الکترونیکی آشنایی عملی دارم و مشتاق یادگیری اتوماسیون در محیط واقعی صنعتی هستم."
  );
  await ensureApplication(
    i4.id,
    maryam.id,
    "pending",
    "پایان‌نامه من در حوزه بهینه‌سازی زمان‌بندی تولید است و می‌توانم به واحد برنامه‌ریزی شما کمک کنم."
  );
  await ensureApplication(
    i5.id,
    hossein.id,
    "rejected",
    "آشنایی کامل با SolidWorks دارم و به نگهداری تجهیزات صنعتی علاقه‌مندم."
  );

  /* --------------------------- Letters ---------------------------- */
  const existingLetter = await db.query.letters.findFirst({
    where: eq(letters.serialNo, "MN-1404-0001"),
  });
  if (!existingLetter) {
    const saraApp = await db.query.applications.findFirst({
      where: (t, { eq: e, and: a }) =>
        a(e(t.internshipId, i1.id), e(t.studentId, sara.id)),
    });
    if (saraApp) {
      await db.insert(letters).values({
        studentId: sara.id,
        internshipId: i1.id,
        applicationId: saraApp.id,
        serialNo: "MN-1404-0001",
      university: sara.university ?? "دانشگاه",
      studentName: saraUser.fullName,
      studentNumber: sara.studentNumber,
      studentMajor: sara.major,
      studentGrade: sara.grade,
      companyName: pars.name,
      internshipTitle: i1.title,
      startDate: i1.startDate ?? "",
      endDate: i1.endDate ?? "",
      });
    }
  }

  return { passwordHash, admin, sara, ali, maryam, hossein };
}

/* ----------------------- Lazy runtime seed ----------------------- */
declare global {
  // eslint-disable-next-line no-var
  var __karamoozyarSeeded: boolean | undefined;
}

let seedingPromise: Promise<void> | null = null;

export async function ensureSeed() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (globalThis.__karamoozyarSeeded) return;
  if (!seedingPromise) {
    seedingPromise = seedDatabase()
      .then(() => {
        globalThis.__karamoozyarSeeded = true;
      })
      .catch((err) => {
        console.error("Seed failed:", err);
        seedingPromise = null;
      });
  }
  await seedingPromise;
}
