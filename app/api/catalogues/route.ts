import { NextRequest, NextResponse } from "next/server";
import { parseExcel } from "@/lib/excel";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

export async function POST(
  request: NextRequest
) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const name = formData.get("name");
    const description =
      formData.get("description");

    // -----------------------------
    // Basic request validation
    // -----------------------------

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Excel file is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error: "Catalogue name is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Parse and validate Excel
    // -----------------------------

    const parsed = await parseExcel(file);

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: "Excel validation failed.",
          errors: parsed.errors,
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Generate catalogue slug
    // -----------------------------

    const baseSlug = createSlug(name);

    let slug = baseSlug;

    const existing =
      await prisma.catalogue.findUnique({
        where: {
          slug,
        },
      });

    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    // -----------------------------
    // Create catalogue + models
    // -----------------------------

    const catalogue =
  await prisma.catalogue.create({
    data: {
      name: name.trim(),

      slug,

      description:
        typeof description === "string"
          ? description
          : undefined,

          models: {
            create: parsed.models.map(
              (model) => ({
                modelId: model.model_id,
                name: model.model_name,
                developer: model.developer,

                description:
                  model.description || null,

                parameters:
                  model.parameters || null,

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

                benchmarks: {
                  create:
                    parsed.benchmarks
                      .filter(
                        (benchmark) =>
                          benchmark.model_id ===
                          model.model_id
                      )
                      .map(
                        (benchmark) => ({
                          benchmark:
                            benchmark.benchmark,

                          score:
                            Number(
                              benchmark.score
                            ),
                        })
                      ),
                },
              })
            ),
          },
        },

        include: {
          models: true,
        },
      });

    // -----------------------------
    // Success
    // -----------------------------

    return NextResponse.json({
      success: true,

      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        slug: catalogue.slug,
        modelCount:
          catalogue.models.length,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the catalogue.",
      },
      {
        status: 500,
      }
    );
  }
}