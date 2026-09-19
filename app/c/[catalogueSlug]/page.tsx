import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import CatalogueBrowser from "@/components/catalogue/CatalogueBrowser";

type CataloguePageProps = {
  params: Promise<{
    catalogueSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CataloguePageProps): Promise<Metadata> {
  const { catalogueSlug } = await params;

  const catalogue = await prisma.catalogue.findUnique({
    where: {
      slug: catalogueSlug,
    },
    select: {
      name: true,
      description: true,
    },
  });

  if (!catalogue) {
    return {
      title: "Catalogue Not Found",
    };
  }

  const description =
    catalogue.description ||
    `Explore models, specifications, benchmarks and comparisons in ${catalogue.name}.`;

  return {
    title: catalogue.name,
    description,

    openGraph: {
      title: catalogue.name,
      description,
      type: "website",
    },

    twitter: {
      card: "summary",
      title: catalogue.name,
      description,
    },
  };
}

export default async function CataloguePage({
  params,
}: CataloguePageProps) {
  const { catalogueSlug } = await params;

  const catalogue = await prisma.catalogue.findUnique({
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

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b-4 border-double border-stone-900 pb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              PROGRAMMATIC CATALOGUE
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/upload"
                className="border border-stone-400 bg-[#fffdf8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-700 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
              >
                New Catalogue
              </a>

              <a
                href={`/c/${catalogue.slug}/add-models`}
                className="border border-stone-900 bg-stone-900 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-stone-700"
              >
                + Add Models
              </a>

              <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                {catalogue.models.length}{" "}
                {catalogue.models.length === 1
                  ? "Entry"
                  : "Entries"}
              </p>
            </div>
          </div>

          <h1 className="mt-5 font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
            {catalogue.name}
          </h1>

          {catalogue.description && (
            <p className="mt-4 max-w-3xl font-serif text-lg leading-7 text-stone-600">
              {catalogue.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <span>Model Intelligence</span>

            <span className="text-stone-300">|</span>

            <span>Specifications</span>

            <span className="text-stone-300">|</span>

            <span>Benchmarks</span>

            <span className="text-stone-300">|</span>

            <span>Comparison</span>
          </div>
        </header>

        {/* Catalogue Browser */}
        <div className="mt-8">
          <CatalogueBrowser
            catalogueSlug={catalogue.slug}
            models={catalogue.models}
          />
        </div>
      </div>
    </main>
  );
}