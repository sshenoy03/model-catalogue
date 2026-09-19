import * as XLSX from "xlsx";
import { ExcelBenchmark, ExcelModel } from "@/types/catalogue";
import {
  modelSchema,
  benchmarkSchema,
} from "./validation";

export type ParsedCatalogue = {
  models: ExcelModel[];
  benchmarks: ExcelBenchmark[];
  errors: string[];
};

export async function parseExcel(
  file: File
): Promise<ParsedCatalogue> {
  const errors: string[] = [];

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  if (!workbook.SheetNames.includes("Models")) {
    errors.push(
      "Missing required sheet: Models"
    );
  }

  if (!workbook.SheetNames.includes("Benchmarks")) {
    errors.push(
      "Missing required sheet: Benchmarks"
    );
  }

  if (errors.length > 0) {
    return {
      models: [],
      benchmarks: [],
      errors,
    };
  }

  const modelsSheet =
    workbook.Sheets["Models"];

  const benchmarksSheet =
    workbook.Sheets["Benchmarks"];

  const models =
    XLSX.utils.sheet_to_json<ExcelModel>(
      modelsSheet,
      {
        defval: "",
      }
    );

  const benchmarks =
    XLSX.utils.sheet_to_json<ExcelBenchmark>(
      benchmarksSheet,
      {
        defval: "",
      }
    );

  const validModels: ExcelModel[] = [];

  models.forEach((model, index) => {
    const result = modelSchema.safeParse(model);

    if (!result.success) {
      errors.push(
        `Models row ${index + 2}: ${result.error.issues
          .map((issue) => issue.message)
          .join(", ")}`
      );
    } else {
      validModels.push(result.data);
    }
  });

  const validBenchmarks: ExcelBenchmark[] = [];

  benchmarks.forEach((benchmark, index) => {
    const result =
      benchmarkSchema.safeParse(benchmark);

    if (!result.success) {
      errors.push(
        `Benchmarks row ${index + 2}: ${result.error.issues
          .map((issue) => issue.message)
          .join(", ")}`
      );
    } else {
      validBenchmarks.push(result.data);
    }
  });

  return {
    models: validModels,
    benchmarks: validBenchmarks,
    errors,
  };
}