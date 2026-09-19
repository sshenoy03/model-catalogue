"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";

export default function AddModelsPage() {
  const params = useParams<{
    catalogueSlug: string;
  }>();

  const catalogueSlug = params.catalogueSlug;

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setErrors([]);
    setSuccess("");

    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to add models to the catalogue."
        );

        if (Array.isArray(data.errors)) {
          setErrors(data.errors);
        }

        setLoading(false);
        return;
      }

      setSuccess(
        `${data.addedCount ?? 0} model${
          data.addedCount === 1 ? "" : "s"
        } added/updated successfully.`
      );

      setFile(null);

      const fileInput = document.getElementById(
        "file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setLoading(false);
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while updating the catalogue."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b-4 border-double border-stone-900 pb-7">
          <a
            href={`/c/${catalogueSlug}`}
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 transition hover:text-stone-900"
          >
            ← Back to Catalogue
          </a>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            CATALOGUE MANAGEMENT
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
            Add Models
          </h1>

          <p className="mt-4 max-w-2xl font-serif text-lg leading-7 text-stone-600">
            Upload an Excel workbook to add new models
            and benchmark data to this catalogue.
          </p>
        </header>

        {/* Upload form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-stone-300 bg-[#fffdf8]"
        >
          <section>
            <div className="border-b border-stone-300 bg-[#faf7ef] px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                DATA UPDATE
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                Upload model data
              </h2>
            </div>

            <div className="px-6 py-7">
              <label
                htmlFor="file"
                className="block text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500"
              >
                Excel File
              </label>

              <div className="mt-2 border border-dashed border-stone-400 bg-[#faf8f1] p-6">
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  disabled={loading}
                  onChange={(event) => {
                    const selectedFile =
                      event.target.files?.[0] ?? null;

                    setFile(selectedFile);
                    setError("");
                    setErrors([]);
                    setSuccess("");
                  }}
                  className="block w-full cursor-pointer text-sm text-stone-600 file:mr-4 file:border file:border-stone-400 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-stone-700"
                />

                <p className="mt-4 text-xs leading-5 text-stone-500">
                  Accepted formats: .xlsx and .xls
                </p>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  The workbook must contain{" "}
                  <span className="font-semibold text-stone-700">
                    Models
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-stone-700">
                    Benchmarks
                  </span>{" "}
                  sheets.
                </p>
              </div>

              {file && (
                <div className="mt-4 border-l-2 border-stone-900 bg-[#faf7ef] px-4 py-3">
                  <p className="text-xs font-semibold text-stone-800">
                    Selected file
                  </p>

                  <p className="mt-1 break-all text-sm text-stone-600">
                    {file.name}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Success message */}
          {success && (
            <section className="border-t border-stone-300 bg-stone-100 px-6 py-5">
              <p className="text-sm font-semibold text-stone-800">
                {success}
              </p>

              <a
                href={`/c/${catalogueSlug}`}
                className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.12em] text-stone-600 underline underline-offset-4 hover:text-stone-900"
              >
                View Updated Catalogue →
              </a>
            </section>
          )}

          {/* Error messages */}
          {(error || errors.length > 0) && (
            <section className="border-t border-red-300 bg-red-50 px-6 py-5">
              {error && (
                <p className="text-sm font-semibold text-red-800">
                  {error}
                </p>
              )}

              {errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                    Validation Errors
                  </p>

                  <ul className="mt-2 space-y-1">
                    {errors.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="text-xs leading-5 text-red-700"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-4 border-t border-stone-300 bg-[#faf7ef] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-500">
              Existing catalogue data will be preserved.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="border border-stone-900 bg-stone-900 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Updating Catalogue..."
                : "Add Models"}
            </button>
          </div>
        </form>

        {/* How it works */}
        <section className="mt-8 border-t border-stone-300 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
            How it works
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="border border-stone-300 bg-[#fffdf8] p-5">
              <p className="font-serif text-lg font-semibold">
                01. Upload
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                Upload a workbook containing your model
                and benchmark data.
              </p>
            </div>

            <div className="border border-stone-300 bg-[#fffdf8] p-5">
              <p className="font-serif text-lg font-semibold">
                02. Update
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                New models will be added while existing
                models can be updated.
              </p>
            </div>

            <div className="border border-stone-300 bg-[#fffdf8] p-5">
              <p className="font-serif text-lg font-semibold">
                03. Share
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                Your catalogue keeps the same shareable
                URL after the update.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}