"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SelectorModel = {
  id: string;
  modelId: string;
  name: string;
  developer: string;
};

type ComparisonSelectorProps = {
  catalogueSlug: string;
  models: SelectorModel[];
  selectedModelIds: string[];
};

export default function ComparisonSelector({
  catalogueSlug,
  models,
  selectedModelIds,
}: ComparisonSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedModels = useMemo(
    () =>
      models.filter((model) =>
        selectedModelIds.includes(model.modelId)
      ),
    [models, selectedModelIds]
  );

  const availableModels = useMemo(
    () =>
      models.filter(
        (model) =>
          !selectedModelIds.includes(model.modelId)
      ),
    [models, selectedModelIds]
  );

  function updateComparison(nextIds: string[]) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (nextIds.length === 0) {
      params.delete("models");
    } else {
      params.set("models", nextIds.join(","));
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname
    );
  }

  function removeModel(modelId: string) {
    const nextIds = selectedModelIds.filter(
      (id) => id !== modelId
    );

    updateComparison(nextIds);
  }

  function addModel(modelId: string) {
    if (selectedModelIds.length >= 3) {
      return;
    }

    if (selectedModelIds.includes(modelId)) {
      return;
    }

    updateComparison([
      ...selectedModelIds,
      modelId,
    ]);
  }

  return (
    <section className="mt-8 border border-stone-300 bg-[#fffdf8]">
      <div className="border-b border-stone-300 bg-[#faf7ef] px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Comparison Set
            </p>

            <p className="mt-1 font-serif text-lg font-semibold text-stone-900">
              {selectedModels.length} of 3 models selected
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
            Maximum 3 models
          </p>
        </div>
      </div>

      <div className="divide-y divide-stone-200">
        {selectedModels.map((model) => (
          <div
            key={model.id}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="font-serif text-base font-semibold text-stone-900">
                {model.name}
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                {model.developer}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                removeModel(model.modelId)
              }
              className="shrink-0 border border-stone-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {selectedModels.length < 3 &&
        availableModels.length > 0 && (
          <div className="border-t border-stone-300 px-5 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                htmlFor="add-model"
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500"
              >
                Add model
              </label>

              <select
                id="add-model"
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    addModel(event.target.value);
                  }
                }}
                className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-900 sm:max-w-md"
              >
                <option value="">
                  Select a model to add...
                </option>

                {availableModels.map((model) => (
                  <option
                    key={model.id}
                    value={model.modelId}
                  >
                    {model.name} — {model.developer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      {selectedModels.length >= 3 && (
        <div className="border-t border-stone-300 px-5 py-4">
          <p className="text-xs text-stone-500">
            Maximum of 3 models reached. Remove a
            model to add another.
          </p>
        </div>
      )}
    </section>
  );
}