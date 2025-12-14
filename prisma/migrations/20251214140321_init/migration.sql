-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_materialId_fkey";

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "assignedTo" TEXT;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
