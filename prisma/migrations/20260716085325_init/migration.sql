-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ChildStatus" AS ENUM ('IN_ROOM', 'OUTSIDE');

-- CreateEnum
CREATE TYPE "ChildRole" AS ENUM ('OWNER', 'PARENT', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('ACTIVE', 'FINISHED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('USER', 'CHILD', 'VISIT', 'SETTINGS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeRole" "EmployeeRole",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "cardNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "ChildStatus" NOT NULL DEFAULT 'OUTSIDE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "role" "ChildRole" NOT NULL DEFAULT 'PARENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "openedById" TEXT,
    "closedById" TEXT,
    "status" "VisitStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "priceCents" INTEGER,
    "isFreeVisit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "priceFirst30MinutesCents" INTEGER NOT NULL,
    "priceNext10MinutesCents" INTEGER NOT NULL,
    "freeVisitEvery" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UAH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" "AuditEntity" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Child_cardNumber_key" ON "Child"("cardNumber");

-- CreateIndex
CREATE INDEX "Child_status_idx" ON "Child"("status");

-- CreateIndex
CREATE INDEX "ChildAccess_userId_idx" ON "ChildAccess"("userId");

-- CreateIndex
CREATE INDEX "ChildAccess_childId_idx" ON "ChildAccess"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildAccess_userId_childId_key" ON "ChildAccess"("userId", "childId");

-- CreateIndex
CREATE INDEX "Visit_childId_idx" ON "Visit"("childId");

-- CreateIndex
CREATE INDEX "Visit_status_idx" ON "Visit"("status");

-- CreateIndex
CREATE INDEX "Visit_startedAt_idx" ON "Visit"("startedAt");

-- CreateIndex
CREATE INDEX "Visit_openedById_idx" ON "Visit"("openedById");

-- CreateIndex
CREATE INDEX "Visit_closedById_idx" ON "Visit"("closedById");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");

-- AddForeignKey
ALTER TABLE "ChildAccess" ADD CONSTRAINT "ChildAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildAccess" ADD CONSTRAINT "ChildAccess_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
