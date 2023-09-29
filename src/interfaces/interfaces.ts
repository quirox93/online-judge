export interface Source {
  id: string;
  content: string;
  category?: string;
  source?: string;
  title: string;
  similarity: number;
}
export interface Value {
  question?: string;
  answer?: string;
  sources?: string;
}

export interface Match {
  content: string;
  id: number;
}
