"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setErrors([]);

    if (!name.trim()) {
      setError("Catalogue name is required.");
      return;
    }

    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("file", file);

      const response = await fetch("/api/catalogues", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create the catalogue."
        );

        if (Array.isArray(data.errors)) {
          setErrors(data.errors);
        }

        setLoading(false);
        return;
      }

      if (!data.catalogue?.slug) {
        setError(
          "Catalogue was created, but no catalogue URL was returned."
        );

        setLoading(false);
        return;
      }

      window.location.href = `/c/${data.catalogue.slug}`;
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while creating the catalogue."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-stone-900">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b-4 border-double border-stone-900 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            PROGRAMMATIC CATALOGUE
          </p>

          <h1 className="mt-5 font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
            Create a Catalogue
          </h1>

          <p className="mt-4 max-w-2xl font-serif text-lg leading-7 text-stone-600">
            Upload a structured Excel workbook to generate a searchable,
            shareable catalogue of models.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-stone-300 bg-[#fffdf8]"
        >
          {/* Catalogue information */}
          <section className="border-b border-stone-300">
            <div className="border-b border-stone-300 bg-[#faf7ef] px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                01 — Catalogue Information
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                Define your catalogue
              </h2>
            </div>

            <div className="space-y-6 px-6 py-7">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500"
                >
                  Catalogue Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Open Source LLM Catalogue"
                  disabled={loading}
                  className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 font-serif text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 disabled:bg-stone-100"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500"
                >
                  Description
                  <span className="ml-2 font-normal text-stone-400">
                    Optional
                  </span>
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="A short description of what this catalogue contains..."
                  rows={4}
                  disabled={loading}
                  className="mt-2 w-full resize-none border border-stone-300 bg-white px-4 py-3 font-serif text-base leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 disabled:bg-stone-100"
                />
              </div>
            </div>
          </section>

          {/* Excel upload */}
          <section>
            <div className="border-b border-stone-300 bg-[#faf7ef] px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                02 — Data Source
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                Upload Excel workbook
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

          {/* Errors */}
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
            <div>
              <p className="text-xs text-stone-500">
                Your catalogue will be available at a shareable URL.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="border border-stone-900 bg-stone-900 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Catalogue..."
                : "Create Catalogue"}
            </button>
          </div>
        </form>

        {/* Workbook structure note */}
        <section className="mt-8 border-t border-stone-300 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
            Workbook Structure
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="border border-stone-300 bg-[#fffdf8] p-5">
              <p className="font-serif text-lg font-semibold text-stone-900">
                Models
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                Contains model metadata such as model ID, name, developer,
                parameters, context length, license and URLs.
              </p>
            </div>

            <div className="border border-stone-300 bg-[#fffdf8] p-5">
              <p className="font-serif text-lg font-semibold text-stone-900">
                Benchmarks
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                Contains benchmark scores linked to each model through its
                model ID.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}