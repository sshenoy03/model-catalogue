import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ComparisonSelector from "@/components/catalogue/ComparisonSelector";

type ComparePageProps = {
  params: Promise<{
    catalogueSlug: string;
  }>;

  searchParams: Promise<{
    models?: string;
  }>;
};

export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { catalogueSlug } = await params;
  const { models } = await searchParams;

  const catalogue =
    await prisma.catalogue.findUnique({
      where: {
        slug: catalogueSlug,
      },
      include: {
        models: {
          include: {
            benchmarks: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

  if (!catalogue) {
    notFound();
  }

  const selectedIds = models
    ? models
        .split(",")
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const selectedModels =
    catalogue.models.filter((model) =>
      selectedIds.includes(model.modelId)
    );

  const benchmarkNames = Array.from(
    new Set(
      selectedModels.flatMap((model) =>
        model.benchmarks.map(
          (benchmark) => benchmark.benchmark
        )
      )
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          href={`/c/${catalogue.slug}`}
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 hover:text-stone-900"
        >
          ← Back to {catalogue.name}
        </Link>

        {/* Masthead */}
        <header className="mt-7 border-b-4 border-double border-stone-900 pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Model Intelligence
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
            Compare Models
          </h1>

          <p className="mt-4 max-w-2xl font-serif text-lg leading-7 text-stone-600">
            Compare specifications and benchmark
            performance across selected models.
          </p>

          {selectedModels.length > 0 && (
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
              {selectedModels.length}{" "}
              {selectedModels.length === 1
                ? "model"
                : "models"}{" "}
              selected
            </p>
          )}
        </header>

        {/* Interactive comparison selector */}
        <ComparisonSelector
          catalogueSlug={catalogue.slug}
          models={catalogue.models}
          selectedModelIds={selectedIds}
        />

        {selectedModels.length < 2 ? (
          <div className="mt-8 border border-dashed border-stone-300 bg-[#fffdf8] px-6 py-16 text-center">
            <p className="font-serif text-2xl font-semibold text-stone-800">
              Select at least 2 models
            </p>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
              Add another model above to begin
              comparing specifications and benchmark
              performance.
            </p>

            <Link
              href={`/c/${catalogue.slug}`}
              className="mt-6 inline-block border border-stone-900 bg-stone-900 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
            >
              Browse Models
            </Link>
          </div>
        ) : (
          <>
            {/* Selected model cards */}
            <section className="mt-8 grid gap-px border border-stone-300 bg-stone-300 md:grid-cols-2 lg:grid-cols-3">
              {selectedModels.map((model) => (
                <Link
                  key={model.id}
                  href={`/c/${catalogue.slug}/models/${model.modelId}`}
                  className="bg-[#fffdf8] p-5 transition hover:bg-[#faf7ef]"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                    {model.developer}
                  </p>

                  <p className="mt-1 font-serif text-xl font-semibold text-stone-900">
                    {model.name}
                  </p>

                  <p className="mt-2 text-[10px] uppercase tracking-wider text-stone-400">
                    View model profile →
                  </p>
                </Link>
              ))}
            </section>

            {/* Specifications */}
            <section className="mt-10">
              <ComparisonSectionHeading>
                Specifications
              </ComparisonSectionHeading>

              <ComparisonTable
                catalogueSlug={catalogue.slug}
                models={selectedModels}
              >
                <ComparisonRow
                  label="Parameters"
                  models={selectedModels}
                  getValue={(model) =>
                    model.parameters
                  }
                />

                <ComparisonRow
                  label="Context Length"
                  models={selectedModels}
                  getValue={(model) =>
                    model.contextLength
                      ? model.contextLength.toLocaleString()
                      : null
                  }
                />

                <ComparisonRow
                  label="License"
                  models={selectedModels}
                  getValue={(model) =>
                    model.license
                  }
                />

                <ComparisonRow
                  label="Modality"
                  models={selectedModels}
                  getValue={(model) =>
                    model.modality
                  }
                />

                <ComparisonRow
                  label="Model Type"
                  models={selectedModels}
                  getValue={(model) =>
                    model.modelType
                  }
                />
              </ComparisonTable>
            </section>

            {/* Benchmarks */}
            <section className="mt-10">
              <ComparisonSectionHeading>
                Benchmark Performance
              </ComparisonSectionHeading>

              {benchmarkNames.length === 0 ? (
                <div className="mt-5 border border-dashed border-stone-300 bg-[#fffdf8] p-10 text-center">
                  <p className="font-serif text-lg text-stone-700">
                    No benchmark data available.
                  </p>
                </div>
              ) : (
                <ComparisonTable
                  catalogueSlug={catalogue.slug}
                  models={selectedModels}
                >
                  {benchmarkNames.map(
                    (benchmarkName) => (
                      <ComparisonRow
                        key={benchmarkName}
                        label={benchmarkName}
                        models={selectedModels}
                        getBenchmark={(model) =>
                          getBenchmark(
                            model,
                            benchmarkName
                          )
                        }
                      />
                    )
                  )}
                </ComparisonTable>
              )}
            </section>

            {/* Bottom navigation */}
            <div className="mt-10 border-t border-stone-300 pt-6">
              <Link
                href={`/c/${catalogue.slug}`}
                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
              >
                ← Browse all models
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------ */
/* Section heading                                  */
/* ------------------------------------------------ */

function ComparisonSectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between border-b border-stone-900 pb-3">
      <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
        {children}
      </h2>

      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400">
        Comparison
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Comparison table                                 */
/* ------------------------------------------------ */

function ComparisonTable({
  catalogueSlug,
  models,
  children,
}: {
  catalogueSlug: string;

  models: Array<{
    id: string;
    modelId: string;
    name: string;
    developer: string;

    parameters: string | null;
    contextLength: number | null;
    license: string | null;
    modality: string | null;
    modelType: string | null;

    benchmarks: Array<{
      benchmark: string;
      score: number;
    }>;
  }>;

  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 overflow-x-auto border border-stone-300 bg-[#fffdf8]">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-300 bg-[#faf7ef]">
            <th className="w-52 border-r border-stone-200 px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Specification
            </th>

            {models.map((model) => (
              <th
                key={model.id}
                className="px-5 py-4 text-left"
              >
                <Link
                  href={`/c/${catalogueSlug}/models/${model.modelId}`}
                  className="font-serif text-base font-semibold text-stone-900 hover:underline"
                >
                  {model.name}
                </Link>

                <p className="mt-1 text-[10px] font-normal uppercase tracking-wider text-stone-400">
                  {model.developer}
                </p>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------ */
/* Comparison row                                   */
/* ------------------------------------------------ */

function ComparisonRow({
  label,
  models,
  getValue,
  getBenchmark,
}: {
  label: string;

  models: Array<{
    id: string;

    parameters: string | null;
    contextLength: number | null;
    license: string | null;
    modality: string | null;
    modelType: string | null;

    benchmarks: Array<{
      benchmark: string;
      score: number;
    }>;
  }>;

  getValue?: (
    model: (typeof models)[number]
  ) => string | null | undefined;

  getBenchmark?: (
    model: (typeof models)[number]
  ) => number | null;
}) {
  return (
    <tr className="border-b border-stone-200 last:border-b-0">
      <td className="whitespace-nowrap border-r border-stone-200 bg-[#faf7ef] px-5 py-4 font-medium text-stone-600">
        {label}
      </td>

      {models.map((model) => (
        <td
          key={model.id}
          className="px-5 py-4 text-stone-900"
        >
          {getBenchmark
            ? getBenchmark(model) ?? "—"
            : getValue?.(model) || "—"}
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------ */
/* Benchmark lookup                                 */
/* ------------------------------------------------ */

function getBenchmark(
  model: {
    benchmarks: Array<{
      benchmark: string;
      score: number;
    }>;
  },
  benchmarkName: string
) {
  return (
    model.benchmarks.find(
      (benchmark) =>
        benchmark.benchmark ===
        benchmarkName
    )?.score ?? null
  );
}