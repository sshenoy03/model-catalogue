import { NextRequest, NextResponse } from "next/server";

import { parseExcel } from "@/lib/excel";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    catalogueSlug: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { catalogueSlug } = await params;

    console.log(
      "Updating catalogue:",
      catalogueSlug
    );

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Excel file is required.",
        },
        { status: 400 }
      );
    }

    const catalogue =
      await prisma.catalogue.findUnique({
        where: {
          slug: catalogueSlug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

    if (!catalogue) {
      return NextResponse.json(
        {
          error: "Catalogue not found.",
        },
        { status: 404 }
      );
    }

    const parsed = await parseExcel(file);

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: "Excel validation failed.",
          errors: parsed.errors,
        },
        { status: 400 }
      );
    }

    if (parsed.models.length === 0) {
      return NextResponse.json(
        {
          error:
            "The Excel file does not contain any models.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Check duplicate model IDs inside the Excel file
     * --------------------------------------------------
     */

    const modelIds = parsed.models.map(
      (model) => model.model_id
    );

    const duplicateModelIds = modelIds.filter(
      (modelId, index) =>
        modelIds.indexOf(modelId) !== index
    );

    const uniqueDuplicateModelIds = [
      ...new Set(duplicateModelIds),
    ];

    if (uniqueDuplicateModelIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "Duplicate model IDs were found in the Excel file.",
          errors:
            uniqueDuplicateModelIds.map(
              (modelId) =>
                `Duplicate model_id: ${modelId}`
            ),
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Get existing models
     * --------------------------------------------------
     */

    const existingModels =
      await prisma.model.findMany({
        where: {
          catalogueId: catalogue.id,
        },
        select: {
          modelId: true,
        },
      });

    const existingModelIds = new Set(
      existingModels.map(
        (model) => model.modelId
      )
    );

    const uploadedModelIds = new Set(
      modelIds
    );

    /*
     * --------------------------------------------------
     * Validate benchmark references
     * --------------------------------------------------
     */

    const invalidBenchmarkReferences =
      parsed.benchmarks.filter(
        (benchmark) =>
          !uploadedModelIds.has(
            benchmark.model_id
          ) &&
          !existingModelIds.has(
            benchmark.model_id
          )
      );

    if (
      invalidBenchmarkReferences.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Some benchmarks reference models that do not exist in this catalogue.",
          errors:
            invalidBenchmarkReferences.map(
              (benchmark) =>
                `Benchmark "${benchmark.benchmark}" references unknown model_id "${benchmark.model_id}".`
            ),
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * Update catalogue in one transaction
     * --------------------------------------------------
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          let addedCount = 0;
          let updatedCount = 0;
          let benchmarkCount = 0;

          /*
           * Process models
           */

          for (const model of parsed.models) {
            const existingModel =
              await tx.model.findUnique({
                where: {
                  catalogueId_modelId: {
                    catalogueId:
                      catalogue.id,
                    modelId:
                      model.model_id,
                  },
                },
                select: {
                  id: true,
                },
              });

            const savedModel =
              await tx.model.upsert({
                where: {
                  catalogueId_modelId: {
                    catalogueId:
                      catalogue.id,
                    modelId:
                      model.model_id,
                  },
                },

                create: {
                  catalogueId:
                    catalogue.id,

                  modelId:
                    model.model_id,

                  name:
                    model.model_name,

                  developer:
                    model.developer,

                  description:
                    model.description ||
                    null,

                  parameters:
                    model.parameters ||
                    null,

                  contextLength:
                    model.context_length
                      ? Number(
                          model.context_length
                        )
                      : null,

                  license:
                    model.license || null,

                  modality:
                    model.modality || null,

                  modelType:
                    model.model_type || null,

                  huggingfaceUrl:
                    model.huggingface_url ||
                    null,

                  githubUrl:
                    model.github_url || null,

                  documentationUrl:
                    model.documentation_url ||
                    null,
                },

                update: {
                  name:
                    model.model_name,

                  developer:
                    model.developer,

                  description:
                    model.description ||
                    null,

                  parameters:
                    model.parameters ||
                    null,

                  contextLength:
                    model.context_length
                      ? Number(
                          model.context_length
                        )
                      : null,

                  license:
                    model.license || null,

                  modality:
                    model.modality || null,

                  modelType:
                    model.model_type || null,

                  huggingfaceUrl:
                    model.huggingface_url ||
                    null,

                  githubUrl:
                    model.github_url || null,

                  documentationUrl:
                    model.documentation_url ||
                    null,
                },

                select: {
                  id: true,
                  modelId: true,
                },
              });

            if (existingModel) {
              updatedCount++;
            } else {
              addedCount++;
            }

            /*
             * Update benchmarks for this model
             */

            const modelBenchmarks =
              parsed.benchmarks.filter(
                (benchmark) =>
                  benchmark.model_id ===
                  model.model_id
              );

            if (
              modelBenchmarks.length > 0
            ) {
              await tx.modelBenchmark.deleteMany(
                {
                  where: {
                    modelId:
                      savedModel.id,
                  },
                }
              );

              await tx.modelBenchmark.createMany(
                {
                  data:
                    modelBenchmarks.map(
                      (benchmark) => ({
                        modelId:
                          savedModel.id,

                        benchmark:
                          benchmark.benchmark,

                        score: Number(
                          benchmark.score
                        ),
                      })
                    ),
                }
              );

              benchmarkCount +=
                modelBenchmarks.length;
            }
          }

          /*
           * ------------------------------------------------
           * Handle benchmark-only updates
           *
           * This allows an Excel file to update benchmarks
           * for an existing model without including that
           * model in the Models sheet.
           * ------------------------------------------------
           */

          const uploadedModelIdSet =
            new Set(
              parsed.models.map(
                (model) =>
                  model.model_id
              )
            );

          const benchmarkOnlyModelIds = [
            ...new Set(
              parsed.benchmarks
                .map(
                  (benchmark) =>
                    benchmark.model_id
                )
                .filter(
                  (modelId) =>
                    !uploadedModelIdSet.has(
                      modelId
                    )
                )
            ),
          ];

          for (const modelId of
            benchmarkOnlyModelIds) {
            const existingModel =
              await tx.model.findUnique({
                where: {
                  catalogueId_modelId: {
                    catalogueId:
                      catalogue.id,
                    modelId,
                  },
                },
                select: {
                  id: true,
                },
              });

            if (!existingModel) {
              continue;
            }

            const modelBenchmarks =
              parsed.benchmarks.filter(
                (benchmark) =>
                  benchmark.model_id ===
                  modelId
              );

            await tx.modelBenchmark.deleteMany(
              {
                where: {
                  modelId:
                    existingModel.id,
                },
              }
            );

            if (
              modelBenchmarks.length > 0
            ) {
              await tx.modelBenchmark.createMany(
                {
                  data:
                    modelBenchmarks.map(
                      (benchmark) => ({
                        modelId:
                          existingModel.id,

                        benchmark:
                          benchmark.benchmark,

                        score: Number(
                          benchmark.score
                        ),
                      })
                    ),
                }
              );

              benchmarkCount +=
                modelBenchmarks.length;
            }
          }

          return {
            addedCount,
            updatedCount,
            benchmarkCount,
          };
        }
      );

    console.log(
      "Catalogue update successful:",
      result
    );

    return NextResponse.json({
      success: true,

      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        slug: catalogue.slug,
      },

      addedCount:
        result.addedCount,

      updatedCount:
        result.updatedCount,

      benchmarkCount:
        result.benchmarkCount,

      message:
        "Catalogue updated successfully.",
    });
  } catch (error) {
    console.error(
      "Error updating catalogue:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the catalogue.",
      },
      { status: 500 }
    );
  }
}