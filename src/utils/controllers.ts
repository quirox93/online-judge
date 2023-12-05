import OpenAI from "openai";
import { preprocessText } from "./utils.js";
import { supabase } from "@/utils/supabaseBrowser.js";
import type { OficialData, Source } from "@/interfaces/interfaces.js";

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
const getMatchs = async (embedding: number[], question: string) => {
	const { data, error: matchError } = await supabase.rpc(
		"match_documentsv2",
		{
			query_embedding: embedding,
			match_threshold: 0.7,
			match_count: 50,
		}
	);
	const uniques = new Set(data.map((e: any) => e.rule_id));
	const embeddings = data.map((e: any) => {
		return {
			rule_id: e.rule_id,
			content: e.content,
			similarity: e.similarity,
		};
	});
	// const { data: main_rules, error } = await supabase
	//   .from("main_rules")
	//   .select("*")
	//   .in("id", [...uniques]);
	const { data: main_rules, error } = await supabase
		.from("main_rules")
		.select("*");

	const filteredData = main_rules?.filter((row) => {
		if (row.keywords && row.keywords.length > 0) {
			// Verificar si alguno de los elementos en "keywords" está contenido en la cadena de entrada

			if (
				row.keywords.some((keyword: any) =>
					question.toLocaleLowerCase().includes(keyword)
				)
			) {
				row.similarity = 1;
				return true;
			}
		}
		return [...uniques].includes(row.id);
	});

	const result = filteredData?.map((rule) => {
		if (rule.similarity) return rule;
		const similarity = embeddings.find(
			(embeding: any) => embeding.rule_id === rule.id
		).similarity;
		return { ...rule, similarity };
	});

	result?.sort((a, b) => b.similarity - a.similarity);

	return result?.slice(0, 25);
};

export const generateResponse = async (
	question: string,
	cardRef: OficialData[],
	role: string | undefined
) => {
	const { preprocessedText, stemmedTokens } = preprocessText(`${question}`);
	const references = await getCardsData(cardRef);
	const embedding = await createVector(preprocessedText);
	const matchs = (await getMatchs(embedding, question + references)) as any;
	const $matchs = [...matchs];
	const sourcesArr = [] as any;
	matchs
		?.sort((a: any, b: any) => a.id - b.id)
		?.forEach((e: Source) => {
			const content = `- ${e.content} [rule ${e.id}]\n`;
			const finded = sourcesArr.find(
				(s: any) => s.category === e.category
			);
			const findedTitle = sourcesArr.find(
				(s: any) => s.category === e.category && s.title === e.title
			);
			if (findedTitle) {
				findedTitle.content += `${content}\n`;
			} else if (finded) {
				finded.content += `${e.title}\n ${content}\n`;
				finded.title = e.title;
			} else
				sourcesArr.push({
					category: e.category,
					content: `${e.title}\n${content}\n`,
				});
		});
	if (role !== "premium")
		return {
			question: question,
			answer: "Ai answer only for premium users.",
			sources: matchs,
		};
	const content = `Pregunta: ${question}\n${references}\nReglas para responder: ${JSON.stringify(
		sourcesArr
	)}. Responde solamente basandote en las reglas proporcionadas, no supongas nada.`;

	const {
		choices: [{ message }],
	} = await openai.chat.completions.create({
		model: "gpt-4-1106-preview",
		messages: [
			{
				role: "system",
				content: `Eres un asistente que solamente responde las dudas sobre reglas del TCG de Digimon Card Game en base a unas reglas dadas. Si no te dan datos suficientes para responder o no tiene relacion con el juego, responderas: "Perdona, no puedo proporcionar una respuesta precisa". Solo debes responder puntualmente a las preguntas que te hagan, nada mas.`,
			},
			{
				role: "user",
				content: content,
			},
		],
		temperature: 0,
	});
	const result = {
		question: question,
		answer: message.content,
		sources: $matchs,
	};
	return result;
};

const getCardsData = async (arr: OficialData[]) => {
	if (!arr.length) return "";
	const responses = await Promise.all(
		arr.map((card) =>
			fetch(
				`https://api.bandai-tcg-plus.com/api/user/card/${card.id}?app_version=9.9.9`
			)
		)
	);

	// Procesamos los resultados de cada llamada
	const dataPromises = responses.map((response) => response.json());
	const dataArray = await Promise.all(dataPromises);
	const data = dataArray.map((e) => e.success.card);
	return "Datos de algunas cartas: " + JSON.stringify(data) + "\n";
};
export const translateText = async (text: string) => {
	const {
		choices: [{ message }],
	} = await openai.chat.completions.create({
		model: "gpt-4",
		messages: [
			{
				role: "system",
				content: `Eres un traductor del japones al inglés enfocado en el TCG de Digimon Card Game. Solo tienes que responder con la traduccion del JSON recibido manteniendo el formato JSON, nada mas. Usa otro tipo de comillas para los datos dentro de las propiedades del JSON. Ten en cuenta el siguiente diccionario para traducir: [オープン : Reveal]`,
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
