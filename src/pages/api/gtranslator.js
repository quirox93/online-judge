import translate from "@iamtraction/google-translate";

export const POST = async ({ request }) => {
  const { text } = await request.json();

  const { text: question } = await translate(text.question, {
    from: "ja",
    to: "en",
  });
  const { text: answer } = await translate(text.answer, {
    from: "ja",
    to: "en",
  });
  const translation = { question, answer: clean(answer) };

  console.log({ text, translation });
  return new Response(JSON.stringify(translation));
};

const clean = (string) => {
  let cleaned = string;
  for (const key in dictionary) {
    cleaned = cleaned.replace(key, dictionary[key]);
  }
  return cleaned;
};

const dictionary = {
  "Yes, I will demonstrate it.": "Yes, it does.",
};
