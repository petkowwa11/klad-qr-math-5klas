-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" INTEGER NOT NULL,
    "parallel" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "ClassGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classGroupId" TEXT NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    CONSTRAINT "Student_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StationProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "stationIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "wrongTries" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StationProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_grade_parallel_key" ON "ClassGroup"("grade", "parallel");

-- CreateIndex
CREATE UNIQUE INDEX "Student_classGroupId_classNumber_key" ON "Student"("classGroupId", "classNumber");

-- CreateIndex
CREATE INDEX "StationProgress_studentId_idx" ON "StationProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StationProgress_studentId_lessonId_levelId_stationIndex_key" ON "StationProgress"("studentId", "lessonId", "levelId", "stationIndex");
