-- CreateTable
CREATE TABLE "AssetTaFeature" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "interval" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "featuresJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetTaFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaSignal" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "formulaKey" TEXT NOT NULL,
    "formulaName" TEXT NOT NULL,
    "phase" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fitScore" DOUBLE PRECISION NOT NULL,
    "alertLine" TEXT NOT NULL,
    "matchedReasons" JSONB,
    "missingReasons" JSONB,
    "riskTags" JSONB,
    "featuresJson" JSONB,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormulaSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetTaFeature_assetId_time_interval_source_key" ON "AssetTaFeature"("assetId", "time", "interval", "source");
CREATE INDEX "AssetTaFeature_assetId_idx" ON "AssetTaFeature"("assetId");
CREATE INDEX "AssetTaFeature_time_idx" ON "AssetTaFeature"("time");
CREATE INDEX "AssetTaFeature_interval_idx" ON "AssetTaFeature"("interval");
CREATE INDEX "FormulaSignal_assetId_idx" ON "FormulaSignal"("assetId");
CREATE INDEX "FormulaSignal_formulaKey_idx" ON "FormulaSignal"("formulaKey");
CREATE INDEX "FormulaSignal_fitScore_idx" ON "FormulaSignal"("fitScore");
CREATE INDEX "FormulaSignal_triggeredAt_idx" ON "FormulaSignal"("triggeredAt");
CREATE INDEX "FormulaSignal_status_idx" ON "FormulaSignal"("status");

-- AddForeignKey
ALTER TABLE "AssetTaFeature" ADD CONSTRAINT "AssetTaFeature_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FormulaSignal" ADD CONSTRAINT "FormulaSignal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
