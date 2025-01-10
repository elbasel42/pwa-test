/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Keys` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[keyId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[keysId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Keys" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "keyId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "keysId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Keys_userId_key" ON "Keys"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_keyId_key" ON "Subscription"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_keysId_key" ON "User"("keysId");

-- AddForeignKey
ALTER TABLE "Keys" ADD CONSTRAINT "Keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
