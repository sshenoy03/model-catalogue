"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AddModelsPage() {
  const params = useParams();
  const router = useRouter();

  const catalogueSlug = params.catalogueSlug as string;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `/api/catalogues/${catalogueSlug}/models`,
        {
          method: "POST",
          body: formData,
        }
      );

      /*
       * --------------------------------------------------
       * Make sure the server actually returned JSON.
       *
       * This prevents errors such as:
       * "Unexpected token 'S', Server act..."
       * --------------------------------------------------
       */

      const contentType =
        response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Non-JSON response from server:",
          text
        );

        throw new Error(
          `Server returned ${response.status}. Please check that the API route exists and restart the development server.`
        );
      }

      const data = await response.json();

      /*
       * --------------------------------------------------
       * Handle API errors
       * --------------------------------------------------
       */

      if (!response.ok) {
        const validationErrors =
          Array.isArray(data.errors)
            ? data.errors.join("\n")
            : "";

        throw new Error(
          validationErrors
            ? `${data.error}\n${validationErrors}`
            : data.error ||
                "Something went wrong while updating the catalogue."
        );
      }

      /*
       * --------------------------------------------------
       * Success
       * --------------------------------------------------
       */

      setSuccess(
        `Catalogue updated successfully. Added ${data.addedCount} models, updated ${data.updatedCount} models, and processed ${data.benchmarkCount} benchmarks.`
      );

      setFile(null);

      /*
       * Reset file input
       */

      const fileInput =
        document.getElementById(
          "excel-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Catalogue update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the catalogue."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setError("");
    setSuccess("");
  }

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <header className="border-b-4 border-double border-stone-900 pb-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              PROGRAMMATIC CATALOGUE
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/c/${catalogueSlug}`
                )
              }
              className="border border-stone-400 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              Back to Catalogue
            </button>
          </div>

          <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
            Add Models
          </h1>

          <p className="mt-4 max-w-2xl font-serif text-lg leading-7 text-stone-600">
            Update this catalogue using an Excel
            workbook. Existing models will be
            updated, new models will be added, and
            benchmark data will be refreshed.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <span>Add Models</span>

            <span className="text-stone-300">
              |
            </span>

            <span>Update Models</span>

            <span className="text-stone-300">
              |
            </span>

            <span>Update Benchmarks</span>

            <span className="text-stone-300">
              |
            </span>

            <span>Same Catalogue URL</span>
          </div>
        </header>

        {/* ------------------------------------------------ */}
        {/* Main content */}
        {/* ------------------------------------------------ */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          {/* ---------------------------------------------- */}
          {/* Upload form */}
          {/* ---------------------------------------------- */}

          <section className="border border-stone-300 bg-[#fffdf8]">
            <div className="border-b border-stone-300 bg-[#faf7ef] px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                Catalogue Update
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-950">
                Upload Excel Workbook
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {/* File input */}

              <div>
                <label
                  htmlFor="excel-file"
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500"
                >
                  Excel file
                </label>

                <div className="mt-3 border-2 border-dashed border-stone-300 bg-[#faf8f2] p-6 transition hover:border-stone-500">
                  <input
                    id="excel-file"
                    name="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={
                      handleFileChange
                    }
                    className="block w-full text-sm text-stone-600 file:mr-4 file:border-0 file:bg-stone-900 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-white hover:file:bg-stone-700"
                  />

                  {file && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                        Selected file
                      </p>

                      <p className="mt-1 break-all font-serif text-sm text-stone-800">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        {(
                          file.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected workbook structure */}

              <div className="mt-7 border border-stone-200 bg-[#faf8f2] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
                  Required workbook structure
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-serif text-sm font-semibold text-stone-900">
                      Models
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      model_id, model_name,
                      developer, description,
                      parameters,
                      context_length, license,
                      modality, model_type,
                      huggingface_url,
                      github_url,
                      documentation_url
                    </p>
                  </div>

                  <div className="border-t border-stone-200 pt-3">
                    <p className="font-serif text-sm font-semibold text-stone-900">
                      Benchmarks
                    </p>

                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      model_id, benchmark,
                      score
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}

              {error && (
                <div className="mt-6 border border-red-300 bg-red-50 px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-700">
                    Update failed
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-red-800">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}

              {success && (
                <div className="mt-6 border border-green-300 bg-green-50 px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-700">
                    Update complete
                  </p>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    {success}
                  </p>
                </div>
              )}

              {/* Submit */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={
                    loading || !file
                  }
                  className="border border-stone-900 bg-stone-900 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
                >
                  {loading
                    ? "Updating Catalogue..."
                    : "Update Catalogue"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/c/${catalogueSlug}`
                    )
                  }
                  className="border border-stone-300 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-600 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          {/* ---------------------------------------------- */}
          {/* Information panel */}
          {/* ---------------------------------------------- */}

          <aside className="h-fit border border-stone-300 bg-[#fffdf8]">
            <div className="border-b border-stone-300 bg-[#faf7ef] px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                How Updates Work
              </p>
            </div>

            <div className="divide-y divide-stone-200">
              <div className="px-6 py-5">
                <p className="font-serif text-lg font-semibold text-stone-900">
                  01. Add new models
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Models with a new{" "}
                  <code className="font-mono text-xs">
                    model_id
                  </code>{" "}
                  are added to the existing
                  catalogue.
                </p>
              </div>

              <div className="px-6 py-5">
                <p className="font-serif text-lg font-semibold text-stone-900">
                  02. Update existing models
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  If the{" "}
                  <code className="font-mono text-xs">
                    model_id
                  </code>{" "}
                  already exists, its
                  information is updated rather
                  than creating a duplicate.
                </p>
              </div>

              <div className="px-6 py-5">
                <p className="font-serif text-lg font-semibold text-stone-900">
                  03. Refresh benchmarks
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Benchmark rows supplied for a
                  model replace its existing
                  benchmark records.
                </p>
              </div>

              <div className="px-6 py-5">
                <p className="font-serif text-lg font-semibold text-stone-900">
                  04. URL stays the same
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Updates happen inside the
                  existing PostgreSQL catalogue.
                  Your public catalogue URL does
                  not change.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------ */}
        {/* Important note */}
        {/* ------------------------------------------------ */}

        <section className="mt-8 border-t border-stone-300 pt-6">
          <p className="text-xs leading-6 text-stone-500">
            <span className="font-semibold text-stone-700">
              Note:
            </span>{" "}
            Uploading a workbook does not delete
            models that are missing from the
            workbook. The upload is treated as an
            update/add operation rather than a full
            catalogue replacement.
          </p>
        </section>
      </div>
    </main>
  );
}