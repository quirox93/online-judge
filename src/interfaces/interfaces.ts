export interface Source {
  id: string;
  content: string;
  similarity: string;
}
export interface Value {
  question?: string;
  answer?: string;
  sources?: string;
}
