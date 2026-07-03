-- CreateEnum
CREATE TYPE "exam_type" AS ENUM ('parcial', 'final', 'integrador', 'recuperatorio');

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "career_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "exam_type" "exam_type" NOT NULL,
    "exam_date" DATE NOT NULL,
    "start_time" VARCHAR(10),
    "end_time" VARCHAR(10),
    "location" VARCHAR(200),
    "call_number" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exams_career_id_idx" ON "exams"("career_id");

-- CreateIndex
CREATE INDEX "exams_subject_id_idx" ON "exams"("subject_id");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
