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

export interface OficialData {
  id: number;
  card_number: string;
  card_name: string;
  image_url: string;
}
