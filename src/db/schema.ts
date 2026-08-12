import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const userRoleEnum = pgEnum("user_role", ["student", "company", "admin"]);
export const companyStatusEnum = pgEnum("company_status", [
  "pending",
  "approved",
  "rejected",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const internshipStatusEnum = pgEnum("internship_status", [
  "active",
  "closed",
]);

/* ------------------------------------------------------------------ */
/* Users — سه نقش: دانشجو، نماینده شرکت، مدیر سیستم (دانشگاه)          */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  phone: text("phone"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Students — اطلاعات تحصیلی، مهارت‌ها و رزومه                         */
/* ------------------------------------------------------------------ */

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  university: text("university"),
  major: text("major"),
  grade: text("grade"),
  studentNumber: text("student_number"),
  gpa: text("gpa"),
  skills: text("skills").array(),
  interests: text("interests"),
  about: text("about"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Companies — اطلاعات هویتی شرکت، حوزه فعالیت، آدرس و تماس            */
/* ------------------------------------------------------------------ */

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull(),
  industry: text("industry"),
  description: text("description"),
  address: text("address"),
  website: text("website"),
  contactPhone: text("contact_phone"),
  licenseNumber: text("license_number"),
  status: companyStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Internships — فرصت‌های کارآموزی ثبت‌شده توسط شرکت‌ها                 */
/* ------------------------------------------------------------------ */

export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull().default(1),
  requiredSkills: text("required_skills").array(),
  city: text("city"),
  major: text("major"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  conditions: text("conditions"),
  status: internshipStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Applications — درخواست‌های دانشجویان برای موقعیت‌ها                  */
/* ------------------------------------------------------------------ */

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    internshipId: integer("internship_id")
      .notNull()
      .references(() => internships.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("pending"),
    coverLetter: text("cover_letter"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("application_internship_student_unique").on(
      t.internshipId,
      t.studentId
    ),
  ]
);

/* ------------------------------------------------------------------ */
/* Letters — معرفی‌نامه‌های صادرشده توسط دانشگاه                        */
/* ------------------------------------------------------------------ */

export const letters = pgTable("letters", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  internshipId: integer("internship_id")
    .notNull()
    .references(() => internships.id, { onDelete: "cascade" }),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" })
    .unique(),
  serialNo: text("serial_no").notNull().unique(),
  university: text("university"),
  studentName: text("student_name"),
  studentNumber: text("student_number"),
  studentMajor: text("student_major"),
  studentGrade: text("student_grade"),
  companyName: text("company_name"),
  internshipTitle: text("internship_title"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  applications: many(applications),
  letters: many(letters),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, { fields: [companies.userId], references: [users.id] }),
  internships: many(internships),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  company: one(companies, {
    fields: [internships.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  internship: one(internships, {
    fields: [applications.internshipId],
    references: [internships.id],
  }),
  student: one(students, {
    fields: [applications.studentId],
    references: [students.id],
  }),
}));

export const lettersRelations = relations(letters, ({ one }) => ({
  student: one(students, {
    fields: [letters.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [letters.internshipId],
    references: [internships.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Letter = typeof letters.$inferSelect;
