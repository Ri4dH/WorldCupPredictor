-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "externalId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

