-- CreateTable
CREATE TABLE "IpAllowList" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpAllowList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpAllowList_ip_key" ON "IpAllowList"("ip");

-- CreateIndex
CREATE INDEX "IpAllowList_ip_isActive_idx" ON "IpAllowList"("ip", "isActive");
