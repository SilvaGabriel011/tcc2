ALTER TABLE "datasets" ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedToS3" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "s3Key" TEXT,
ADD COLUMN "s3StorageClass" TEXT;

ALTER TABLE "saved_references" ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedToS3" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "s3Key" TEXT;

ALTER TABLE "audit_logs" ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedToS3" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "s3Key" TEXT;

CREATE INDEX "project_upload_presets_projectId_reviewRequired_idx" ON "project_upload_presets"("projectId", "reviewRequired");

CREATE INDEX "datasets_projectId_status_createdAt_idx" ON "datasets"("projectId", "status", "createdAt");
CREATE INDEX "datasets_status_measurementDate_idx" ON "datasets"("status", "measurementDate");
CREATE INDEX "datasets_hasTemporalData_measurementDate_idx" ON "datasets"("hasTemporalData", "measurementDate");
CREATE INDEX "datasets_archivedAt_idx" ON "datasets"("archivedAt");
CREATE INDEX "datasets_archivedToS3_createdAt_idx" ON "datasets"("archivedToS3", "createdAt");

CREATE INDEX "data_mappings_datasetId_sourceField_idx" ON "data_mappings"("datasetId", "sourceField");
CREATE INDEX "data_mappings_datasetId_targetField_idx" ON "data_mappings"("datasetId", "targetField");

CREATE INDEX "validation_settings_projectId_enabled_idx" ON "validation_settings"("projectId", "enabled");
CREATE INDEX "validation_settings_projectId_field_idx" ON "validation_settings"("projectId", "field");

CREATE INDEX "saved_references_userId_url_idx" ON "saved_references"("userId", "url");
CREATE INDEX "saved_references_userId_source_idx" ON "saved_references"("userId", "source");
CREATE INDEX "saved_references_userId_year_idx" ON "saved_references"("userId", "year");
CREATE INDEX "saved_references_archivedAt_idx" ON "saved_references"("archivedAt");

CREATE INDEX "audit_logs_userId_resource_createdAt_idx" ON "audit_logs"("userId", "resource", "createdAt");
CREATE INDEX "audit_logs_resource_action_idx" ON "audit_logs"("resource", "action");
CREATE INDEX "audit_logs_archivedAt_idx" ON "audit_logs"("archivedAt");
CREATE INDEX "audit_logs_archivedToS3_createdAt_idx" ON "audit_logs"("archivedToS3", "createdAt");

CREATE INDEX "timeseries_data_datasetId_metric_timestamp_idx" ON "timeseries_data"("datasetId", "metric", "timestamp");
CREATE INDEX "timeseries_data_animalId_timestamp_idx" ON "timeseries_data"("animalId", "timestamp");
CREATE INDEX "timeseries_data_lotId_timestamp_idx" ON "timeseries_data"("lotId", "timestamp");
