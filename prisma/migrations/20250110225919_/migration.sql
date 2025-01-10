-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "expirationTime" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keys" (
    "id" SERIAL NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "subscriptionId" INTEGER NOT NULL,

    CONSTRAINT "Keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keys_subscriptionId_key" ON "Keys"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Keys" ADD CONSTRAINT "Keys_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
