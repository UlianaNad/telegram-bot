-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PARENT', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'PARENT';
