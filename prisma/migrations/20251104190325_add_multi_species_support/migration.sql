-- CreateTable
CREATE TABLE "animal_species" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hasSubtypes" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_subtypes" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_subtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_data" (
    "id" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "subtypeId" TEXT,
    "metric" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "idealMinValue" DOUBLE PRECISION,
    "idealMaxValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forage_references" (
    "id" TEXT NOT NULL,
    "forageType" TEXT NOT NULL,
    "variety" TEXT,
    "metric" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "idealValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "season" TEXT,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forage_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "animal_species_code_key" ON "animal_species"("code");

-- CreateIndex
CREATE INDEX "animal_subtypes_speciesId_idx" ON "animal_subtypes"("speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "animal_subtypes_speciesId_code_key" ON "animal_subtypes"("speciesId", "code");

-- CreateIndex
CREATE INDEX "reference_data_speciesId_metric_idx" ON "reference_data"("speciesId", "metric");

-- CreateIndex
CREATE INDEX "reference_data_subtypeId_metric_idx" ON "reference_data"("subtypeId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "reference_data_speciesId_subtypeId_metric_key" ON "reference_data"("speciesId", "subtypeId", "metric");

-- CreateIndex
CREATE INDEX "forage_references_forageType_metric_idx" ON "forage_references"("forageType", "metric");

-- CreateIndex
CREATE INDEX "forage_references_season_idx" ON "forage_references"("season");

-- CreateIndex
CREATE UNIQUE INDEX "forage_references_forageType_variety_metric_season_key" ON "forage_references"("forageType", "variety", "metric", "season");

-- AddForeignKey
ALTER TABLE "animal_subtypes" ADD CONSTRAINT "animal_subtypes_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "animal_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_data" ADD CONSTRAINT "reference_data_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "animal_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_data" ADD CONSTRAINT "reference_data_subtypeId_fkey" FOREIGN KEY ("subtypeId") REFERENCES "animal_subtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
