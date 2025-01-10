/*
  Warnings:

  - You are about to drop the column `subscriptionid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionid_fkey";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionid",
ADD COLUMN     "subscriptionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
