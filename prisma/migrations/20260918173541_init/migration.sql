-- CreateTable
CREATE TABLE "Catalogue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "description" TEXT,
    "parameters" TEXT,
    "contextLength" INTEGER,
    "license" TEXT,
    "modality" TEXT,
    "modelType" TEXT,
    "huggingfaceUrl" TEXT,
    "githubUrl" TEXT,
    "documentationUrl" TEXT,
    "catalogueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelBenchmark" (
    "id" TEXT NOT NULL,
    "benchmark" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "ModelBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalogue_slug_key" ON "Catalogue"("slug");

-- CreateIndex
CREATE INDEX "Model_catalogueId_idx" ON "Model"("catalogueId");

-- CreateIndex
CREATE UNIQUE INDEX "Model_catalogueId_modelId_key" ON "Model"("catalogueId", "modelId");

-- CreateIndex
CREATE INDEX "ModelBenchmark_modelId_idx" ON "ModelBenchmark"("modelId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalogue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelBenchmark" ADD CONSTRAINT "ModelBenchmark_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
