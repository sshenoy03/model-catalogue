import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ModelPageProps = {
  params: Promise<{
    catalogueSlug: string;
    modelSlug: string;
  }>;
};

export default async function ModelPage({
  params,
}: ModelPageProps) {
  const { catalogueSlug, modelSlug } =
    await params;

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

  const modelIndex =
    catalogue.models.findIndex(
      (model) =>
        model.modelId === modelSlug
    );

  if (modelIndex === -1) {
    notFound();
  }

  const model =
    catalogue.models[modelIndex];

  const previousModel =
    modelIndex > 0
      ? catalogue.models[modelIndex - 1]
      : null;

  const nextModel =
    modelIndex <
    catalogue.models.length - 1
      ? catalogue.models[modelIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <Link
          href={`/c/${catalogue.slug}`}
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 hover:text-stone-900"
        >
          ← Back to {catalogue.name}
        </Link>

        {/* Header */}
        <header className="mt-7 border-b-4 border-double border-stone-900 pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Model Profile
          </p>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
                {model.name}
              </h1>

              <p className="mt-3 text-lg text-stone-500">
                {model.developer}
              </p>
            </div>

            {model.modelType && (
              <div className="border border-stone-400 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600">
                {model.modelType}
              </div>
            )}
          </div>

          {model.description && (
            <p className="mt-7 max-w-3xl font-serif text-lg leading-8 text-stone-600">
              {model.description}
            </p>
          )}

          {/* External links */}
          <div className="mt-7 flex flex-wrap gap-3">
            {model.huggingfaceUrl && (
              <ExternalLink
                href={model.huggingfaceUrl}
                label="Hugging Face"
              />
            )}

            {model.githubUrl && (
              <ExternalLink
                href={model.githubUrl}
                label="GitHub"
              />
            )}

            {model.documentationUrl && (
              <ExternalLink
                href={model.documentationUrl}
                label="Documentation"
              />
            )}
          </div>
        </header>

        {/* Key specifications */}
        <section className="border-b border-stone-300 py-9">
          <SectionHeading>
            Key Specifications
          </SectionHeading>

          <div className="mt-6 grid border-t border-stone-300 sm:grid-cols-2 lg:grid-cols-4">
            <Spec
              label="Parameters"
              value={model.parameters}
            />

            <Spec
              label="Context Length"
              value={
                model.contextLength
                  ? model.contextLength.toLocaleString()
                  : null
              }
            />

            <Spec
              label="License"
              value={model.license}
            />

            <Spec
              label="Modality"
              value={model.modality}
            />
          </div>
        </section>

        {/* Benchmarks */}
        <section className="border-b border-stone-300 py-9">
          <SectionHeading>
            Benchmark Performance
          </SectionHeading>

          {model.benchmarks.length === 0 ? (
            <div className="mt-6 border border-dashed border-stone-300 px-6 py-10 text-center">
              <p className="font-serif text-lg text-stone-700">
                No benchmark data available.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden border border-stone-300 bg-[#fffdf8]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-300 bg-[#faf7ef]">
                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                      Benchmark
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                      Score
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {model.benchmarks.map(
                    (benchmark) => (
                      <tr
                        key={benchmark.id}
                        className="border-b border-stone-200 last:border-0"
                      >
                        <td className="px-5 py-4 font-medium text-stone-800">
                          {benchmark.benchmark}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-stone-950">
                          {benchmark.score}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Model navigation */}
        <section className="py-8">
          <div className="grid gap-4 sm:grid-cols-2">

            {previousModel ? (
              <Link
                href={`/c/${catalogue.slug}/models/${previousModel.modelId}`}
                className="group border border-stone-300 bg-[#fffdf8] p-5 transition hover:border-stone-600"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                  ← Previous Model
                </p>

                <p className="mt-2 font-serif text-lg font-semibold text-stone-900 group-hover:underline">
                  {previousModel.name}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  {previousModel.developer}
                </p>
              </Link>
            ) : (
              <div />
            )}

            {nextModel ? (
              <Link
                href={`/c/${catalogue.slug}/models/${nextModel.modelId}`}
                className="group border border-stone-300 bg-[#fffdf8] p-5 text-left transition hover:border-stone-600 sm:text-right"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                  Next Model →
                </p>

                <p className="mt-2 font-serif text-lg font-semibold text-stone-900 group-hover:underline">
                  {nextModel.name}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  {nextModel.developer}
                </p>
              </Link>
            ) : (
              <div />
            )}

          </div>
        </section>

      </div>
    </main>
  );
}

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-stone-900 pb-3">
      <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
        {children}
      </h2>

      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400">
        Catalogue Data
      </span>
    </div>
  );
}

function Spec({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="border-b border-stone-200 px-5 py-5 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 font-serif text-xl font-semibold text-stone-900">
        {value || "—"}
      </p>
    </div>
  );
}

function ExternalLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-stone-400 bg-[#fffdf8] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-700 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
    >
      {label} ↗
    </a>
  );
}