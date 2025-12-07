export interface ExtractedData {
  [key: string]: string | number | null;
}

export type AppState = 'idle' | 'processing' | 'complete';