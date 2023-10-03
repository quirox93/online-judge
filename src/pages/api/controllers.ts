import OpenAI from "openai";
import { preprocessText } from "./utils.js";
import { supabase } from "@/auth.js";

const { SECRET_OPENAI_API_KEY } = import.meta.env;
const openai = new OpenAI({
  apiKey: SECRET_OPENAI_API_KEY,
});

const createVector = async (text: string) => {
  const {
    data: [{ embedding }],
  } = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return embedding;
};
const getMatchs = async (embedding: number[]) => {
  const { data } = await supabase.rpc("match_documentsv2", {
    query_embedding: embedding,
    match_threshold: 0.66,
    match_count: 50,
  });
  const uniques = new Set(data.map((e: any) => e.rule_id));
  const embeddings = data.map((e: any) => {
    return { rule_id: e.rule_id, content: e.content, similarity: e.similarity };
  });
  const { data: main_rules, error } = await supabase
    .from("main_rules")
    .select("*")
    .in("id", [...uniques].slice(0, 10));
  const result = main_rules?.map((rule) => {
    const similarity = embeddings.find(
      (embeding: any) => embeding.rule_id === rule.id
    ).similarity;
    return { ...rule, similarity };
  });
  result?.sort((a, b) => b.similarity - a.similarity);

  return result;
};

export const generateResponse = async (question: string) => {
  const { preprocessedText, stemmedTokens } = preprocessText(question);
  const embedding = await createVector(preprocessedText);
  const matchs = await getMatchs(embedding);

  const context = matchs
    ?.map((e: any) => `Rule ${e.id} -> ${e.title}: ${e.content}`)
    .join("\n");

  const {
    choices: [{ message }],
  } = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Eres un asistente que responde las dudas sobre reglas del TCG de Digimon Card Game basandote solamente y exclusivamente en las siguientes reglas. No des respuestas a menos que este aclarado en las siguientes reglas:\nReglas=\n 
          ${context}\nSi tu pregunta no se encuentra cubierta por estas reglas, responderé con una de las siguientes respuestas: "Perdona, no puedo proporcionar una respuesta precisa" o "No estoy preparado para responder eso.".`,
      },
      {
        role: "user",
        content:
          question +
          "(Importante: no hagas suposiciones a menos que este especificado en tus reglas.)",
      },
    ],
    temperature: 0,
  });
  const result = {
    question: question,
    answer: message.content,
    sources: matchs,
  };
  return result;
};
export const translateText = async (text: string) => {
  const {
    choices: [{ message }],
  } = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Eres un traductor del japones al inglés enfocado en el TCG de Digimon Card Game. Solo tienes que responder con la traduccion del JSON recibido manteniendo el formato JSON, nada mas. Usa otro tipo de comillas para los datos dentro de las propiedades del JSON".`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0,
  });
  const result = {
    translation: message.content,
  };
  return result;
};
