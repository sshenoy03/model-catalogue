export type ExcelModel = {
  model_id: string;
  model_name: string;
  developer: string;
  description?: string;
  parameters?: string;
  context_length?: number | string;
  license?: string;
  modality?: string;
  model_type?: string;
  huggingface_url?: string;
  github_url?: string;
  documentation_url?: string;
};

export type ExcelBenchmark = {
  model_id: string;
  benchmark: string;
  score: number | string;
};
