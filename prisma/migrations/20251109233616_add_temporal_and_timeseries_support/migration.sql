ALTER TABLE "datasets" ADD COLUMN     "measurementDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "farmLocation" TEXT,
ADD COLUMN     "environmentData" TEXT,
ADD COLUMN     "productionSystem" TEXT,
ADD COLUMN     "dataQualityScore" DOUBLE PRECISION,
ADD COLUMN     "hasTemporalData" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasEnvironmental" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "timeseries_data" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "animalId" TEXT,
    "lotId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeseries_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "datasets_measurementDate_idx" ON "datasets"("measurementDate");

-- CreateIndex
CREATE INDEX "timeseries_data_datasetId_idx" ON "timeseries_data"("datasetId");

-- CreateIndex
CREATE INDEX "timeseries_data_timestamp_idx" ON "timeseries_data"("timestamp");

-- CreateIndex
CREATE INDEX "timeseries_data_metric_idx" ON "timeseries_data"("metric");

-- CreateIndex
CREATE INDEX "timeseries_data_datasetId_timestamp_idx" ON "timeseries_data"("datasetId", "timestamp");

-- CreateIndex
CREATE INDEX "timeseries_data_datasetId_metric_idx" ON "timeseries_data"("datasetId", "metric");

-- AddForeignKey
ALTER TABLE "timeseries_data" ADD CONSTRAINT "timeseries_data_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
