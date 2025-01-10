-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endpoint" TEXT NOT NULL,
    "expirationTime" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Keys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    CONSTRAINT "Keys_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Keys_subscriptionId_key" ON "Keys"("subscriptionId");
