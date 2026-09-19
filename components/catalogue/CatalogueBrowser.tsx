"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Benchmark = {
  id: string;
  benchmark: string;
  score: number;
};

type Model = {
  id: string;
  modelId: string;
  name: string;
  developer: string;
  description: string | null;
  parameters: string | null;
  contextLength: number | null;
  license: string | null;
  modality: string | null;
  modelType: string | null;
  benchmarks: Benchmark[];
};

type CatalogueBrowserProps = {
  catalogueSlug: string;
  models: Model[];
};

type SortOption =
  | "name"
  | "parameters"
  | "context";

export default function CatalogueBrowser({
  catalogueSlug,
  models,
}: CatalogueBrowserProps) {
  const [selectedModels, setSelectedModels] =
    useState<string[]>([]);

  const [search, setSearch] = useState("");

  const [developer, setDeveloper] =
    useState("all");

  const [license, setLicense] =
    useState("all");

  const [modelType, setModelType] =
    useState("all");

  const [modality, setModality] =
    useState("all");

  const [sort, setSort] =
    useState<SortOption>("name");

  const developers = useMemo(
    () =>
      getUniqueValues(
        models.map((model) => model.developer)
      ),
    [models]
  );

  const licenses = useMemo(
    () =>
      getUniqueValues(
        models.map((model) => model.license)
      ),
    [models]
  );

  const modelTypes = useMemo(
    () =>
      getUniqueValues(
        models.map((model) => model.modelType)
      ),
    [models]
  );

  const modalities = useMemo(
    () =>
      getUniqueValues(
        models.map((model) => model.modality)
      ),
    [models]
  );

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = models.filter((model) => {
      const matchesSearch =
        !query ||
        model.name
          .toLowerCase()
          .includes(query) ||
        model.modelId
          .toLowerCase()
          .includes(query) ||
        model.developer
          .toLowerCase()
          .includes(query);

      const matchesDeveloper =
        developer === "all" ||
        model.developer === developer;

      const matchesLicense =
        license === "all" ||
        model.license === license;

      const matchesModelType =
        modelType === "all" ||
        model.modelType === modelType;

      const matchesModality =
        modality === "all" ||
        model.modality === modality;

      return (
        matchesSearch &&
        matchesDeveloper &&
        matchesLicense &&
        matchesModelType &&
        matchesModality
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "context") {
        return (
          (b.contextLength ?? 0) -
          (a.contextLength ?? 0)
        );
      }

      if (sort === "parameters") {
        return (
          parseParameterCount(
            b.parameters
          ) -
          parseParameterCount(
            a.parameters
          )
        );
      }

      return 0;
    });
  }, [
    models,
    search,
    developer,
    license,
    modelType,
    modality,
    sort,
  ]);

  function toggleModel(modelId: string) {
    setSelectedModels((current) => {
      if (current.includes(modelId)) {
        return current.filter(
          (id) => id !== modelId
        );
      }

      if (current.length >= 3) {
         return current;
         }

      return [...current, modelId];
    });
  }

  function removeModel(modelId: string) {
    setSelectedModels((current) =>
      current.filter((id) => id !== modelId)
    );
  }

  function compareModels() {
    if (selectedModels.length < 2) {
      return;
    }

    const query = selectedModels.join(",");

    window.location.href =
      `/c/${catalogueSlug}/compare?models=${query}`;
  }

  function clearFilters() {
    setSearch("");
    setDeveloper("all");
    setLicense("all");
    setModelType("all");
    setModality("all");
    setSort("name");
  }

  const hasFilters =
    search ||
    developer !== "all" ||
    license !== "all" ||
    modelType !== "all" ||
    modality !== "all";

  return (
    <>
      {/* Search + Filters */}
      <section className="border-y border-stone-300/80 bg-[#f8f5ed]">
        <div className="px-1 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Search catalogue
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search models, developers or model IDs..."
                  className="h-11 w-full border border-stone-300 bg-[#fffdf8] pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-stone-600 focus:ring-1 focus:ring-stone-600"
                />
              </div>
            </div>

            <div className="w-full lg:w-52">
              <Filter
                label="Sort"
                value={sort}
                onChange={(value) =>
                  setSort(value as SortOption)
                }
                options={[
                  {
                    value: "name",
                    label: "Name A–Z",
                  },
                  {
                    value: "parameters",
                    label: "Parameters",
                  },
                  {
                    value: "context",
                    label: "Context length",
                  },
                ]}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter
              label="Developer"
              value={developer}
              onChange={setDeveloper}
              options={developers.map((value) => ({
                value,
                label: value,
              }))}
            />

            <Filter
              label="License"
              value={license}
              onChange={setLicense}
              options={licenses.map((value) => ({
                value,
                label: value,
              }))}
            />

            <Filter
              label="Model type"
              value={modelType}
              onChange={setModelType}
              options={modelTypes.map((value) => ({
                value,
                label: value,
              }))}
            />

            <Filter
              label="Modality"
              value={modality}
              onChange={setModality}
              options={modalities.map((value) => ({
                value,
                label: value,
              }))}
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
            <p className="text-xs text-stone-500">
              Showing{" "}
              <span className="font-semibold text-stone-800">
                {filteredModels.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-stone-800">
                {models.length}
              </span>{" "}
              models
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-stone-600 underline underline-offset-4 hover:text-stone-950"
              >
                Clear filters
              </button>
            )}Fdst
          </div>
        </div>
      </section>

      {/* Model Grid */}
      <section className="mt-8 pb-32">
        {filteredModels.length === 0 ? (
          <div className="border border-dashed border-stone-300 bg-[#f8f5ed] px-6 py-16 text-center">
            <p className="font-serif text-xl text-stone-800">
              No models found
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 border border-stone-400 px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-stone-900 hover:text-white"
            >
              Reset search
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => {
              const isSelected =
                selectedModels.includes(
                  model.modelId
                );

              return (
                <article
                  key={model.id}
                  className={`group relative flex flex-col border bg-[#fffdf8] transition ${
                    isSelected
                      ? "border-stone-900 ring-1 ring-stone-900"
                      : "border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {/* Card top */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          {model.modelType ||
                            "Model"}
                        </p>

                        <Link
                          href={`/c/${catalogueSlug}/models/${model.modelId}`}
                          className="mt-1 block font-serif text-2xl font-semibold tracking-tight text-stone-900 hover:underline"
                        >
                          {model.name}
                        </Link>

                        <p className="mt-1 text-sm text-stone-500">
                          {model.developer}
                        </p>
                      </div>

                      <span className="shrink-0 border border-stone-300 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-500">
                        {model.modality ||
                          "—"}
                      </span>
                    </div>

                    {model.description && (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-stone-600">
                        {model.description}
                      </p>
                    )}

                    {/* Specifications */}
                    <div className="mt-6 grid grid-cols-2 border-t border-stone-200">
                      <Spec
                        label="Parameters"
                        value={
                          model.parameters
                        }
                      />

                      <Spec
                        label="Context"
                        value={
                          model.contextLength
                            ? `${model.contextLength.toLocaleString()}`
                            : null
                        }
                      />

                      <Spec
                        label="License"
                        value={model.license}
                      />

                      <Spec
                        label="Type"
                        value={
                          model.modelType
                        }
                      />
                    </div>

                    {/* Benchmarks */}
                    {model.benchmarks.length >
                      0 && (
                      <div className="mt-5 border-t border-stone-200 pt-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                          Benchmarks
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
                          {model.benchmarks
                            .slice(0, 4)
                            .map(
                              (
                                benchmark
                              ) => (
                                <div
                                  key={
                                    benchmark.id
                                  }
                                  className="flex items-baseline justify-between gap-2"
                                >
                                  <span className="truncate text-xs text-stone-500">
                                    {
                                      benchmark.benchmark
                                    }
                                  </span>

                                  <span className="text-sm font-semibold text-stone-900">
                                    {
                                      benchmark.score
                                    }
                                  </span>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="mt-auto border-t border-stone-200 bg-[#faf7ef] px-6 py-4">
                    <label className="flex cursor-pointer items-center gap-3 text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleModel(
                            model.modelId
                          )
                        }
                        className="h-4 w-4 accent-stone-900"
                      />

                      <span>
                        Add to comparison
                      </span>

                      {isSelected && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-stone-500">
                          Selected
                        </span>
                      )}
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Comparison Bar */}
      {selectedModels.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-700 bg-stone-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-sm">
         <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Comparison
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {selectedModels.map(
                  (modelId) => {
                    const model =
                      models.find(
                        (item) =>
                          item.modelId ===
                          modelId
                      );

                    return (
                      <button
                        key={modelId}
                        onClick={() =>
                          removeModel(
                            modelId
                          )
                        }
                        className="border border-stone-700 px-3 py-1.5 text-xs text-stone-200 hover:bg-stone-800"
                      >
                        {model?.name} ×
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <button
              onClick={compareModels}
              disabled={
                selectedModels.length < 2
              }
              className="border border-white bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare{" "}
              {selectedModels.length >= 2
                ? `(${selectedModels.length})`
                : ""}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full border border-stone-300 bg-[#fffdf8] px-3 text-sm text-stone-800 outline-none focus:border-stone-600"
      >
        {label !== "Sort" && (
          <option value="all">
            All
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
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
    <div className="border-b border-stone-200 py-3 first:border-r first:pr-4 [&:nth-child(3)]:border-r [&:nth-child(3)]:pr-4">
      <p className="text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-stone-800">
        {value || "—"}
      </p>
    </div>
  );
}

function getUniqueValues(
  values: Array<string | null | undefined>
) {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          Boolean(value)
      )
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );
}

function parseParameterCount(
  value: string | null
) {
  if (!value) {
    return 0;
  }

  const match = value
    .toLowerCase()
    .replace(/,/g, "")
    .match(
      /([\d.]+)\s*(b|m|k)?/
    );

  if (!match) {
    return 0;
  }

  const number = Number(match[1]);

  const unit = match[2];

  if (unit === "b") {
    return number * 1_000_000_000;
  }

  if (unit === "m") {
    return number * 1_000_000;
  }

  if (unit === "k") {
    return number * 1_000;
  }

  return number;
}