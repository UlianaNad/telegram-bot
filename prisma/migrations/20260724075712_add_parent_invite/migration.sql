-- CreateEnum
CREATE TYPE "ParentInviteStatus" AS ENUM ('PENDING', 'FULFILLED');

-- CreateTable
CREATE TABLE "ParentInvite" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "ParentInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParentInvite_phone_idx" ON "ParentInvite"("phone");

-- CreateIndex
CREATE INDEX "ParentInvite_childId_idx" ON "ParentInvite"("childId");

-- AddForeignKey
ALTER TABLE "ParentInvite" ADD CONSTRAINT "ParentInvite_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentInvite" ADD CONSTRAINT "ParentInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
