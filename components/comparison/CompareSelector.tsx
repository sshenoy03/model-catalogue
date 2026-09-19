"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CompareSelectorProps = {
  modelId: string;
  modelName: string;
};

export default function CompareSelector({
  modelId,
  modelName,
}: CompareSelectorProps) {
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>([]);

  function toggleModel() {
    setSelected((current) => {
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

  function compareModels() {
    if (selected.length < 2) {
      return;
    }

    router.push(
      `/c/open-source-catalogue/compare?models=${selected.join(",")}`
    );
  }

  return (
    <div className="mt-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={selected.includes(modelId)}
          onChange={toggleModel}
        />

        <span>
          Compare
        </span>
      </label>

      {selected.length >= 2 && (
        <button
          onClick={compareModels}
          className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Compare {selected.length} models
        </button>
      )}
    </div>
  );
}