-- CreateEnum
CREATE TYPE "degree_type" AS ENUM ('licenciatura', 'ingenieria', 'profesorado', 'tecnicatura', 'doctorado');

-- CreateEnum
CREATE TYPE "subject_type" AS ENUM ('obligatoria', 'electiva', 'optativa', 'taller');

-- CreateEnum
CREATE TYPE "prerequisite_type" AS ENUM ('aprobada', 'regular', 'cursada');

-- CreateEnum
CREATE TYPE "subject_status" AS ENUM ('aprobada', 'regular', 'cursada', 'libre', 'en_curso');

-- CreateEnum
CREATE TYPE "auth_provider" AS ENUM ('email', 'google', 'github');

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(50) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "website_url" VARCHAR(300),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(20),
    "website_url" VARCHAR(300),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(100),
    "degree_type" "degree_type" NOT NULL,
    "total_years" INTEGER NOT NULL,
    "total_credits" INTEGER,
    "plan_code" VARCHAR(50),
    "plan_year" INTEGER,
    "resolution" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_subjects" (
    "id" TEXT NOT NULL,
    "career_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "year_number" INTEGER NOT NULL,
    "semester" INTEGER,
    "is_annual" BOOLEAN NOT NULL DEFAULT false,
    "credits" DECIMAL(5,2),
    "hours_weekly" INTEGER,
    "hours_total" INTEGER,
    "subject_type" "subject_type" NOT NULL DEFAULT 'obligatoria',
    "is_final_thesis" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisites" (
    "id" TEXT NOT NULL,
    "career_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "required_subject_id" TEXT NOT NULL,
    "prerequisite_type" "prerequisite_type" NOT NULL DEFAULT 'aprobada',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "full_name" VARCHAR(200) NOT NULL,
    "avatar_url" VARCHAR(300),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "auth_provider" "auth_provider" NOT NULL DEFAULT 'email',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_academic_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "career_id" TEXT NOT NULL,
    "enrollment_year" INTEGER,
    "student_id" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_academic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subject_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "career_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "status" "subject_status" NOT NULL,
    "grade" DECIMAL(4,2),
    "passed_at" DATE,
    "regularized_at" DATE,
    "attempt_number" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subject_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "career_subjects_career_id_subject_id_key" ON "career_subjects"("career_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "prerequisites_career_id_subject_id_required_subject_id_key" ON "prerequisites"("career_id", "subject_id", "required_subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_academic_profiles_user_id_key" ON "user_academic_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subject_progress_user_id_career_id_subject_id_key" ON "user_subject_progress"("user_id", "career_id", "subject_id");

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careers" ADD CONSTRAINT "careers_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_subjects" ADD CONSTRAINT "career_subjects_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_subjects" ADD CONSTRAINT "career_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_required_subject_id_fkey" FOREIGN KEY ("required_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academic_profiles" ADD CONSTRAINT "user_academic_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academic_profiles" ADD CONSTRAINT "user_academic_profiles_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academic_profiles" ADD CONSTRAINT "user_academic_profiles_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academic_profiles" ADD CONSTRAINT "user_academic_profiles_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
