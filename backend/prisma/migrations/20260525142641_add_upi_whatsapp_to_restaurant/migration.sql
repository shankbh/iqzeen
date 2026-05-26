-- DropIndex
DROP INDEX "Payment_transactionId_key";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "transactionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "upiId" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;
