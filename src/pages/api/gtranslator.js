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
  const translation = { question, answer };

  console.log({ text, translation });
  return new Response(JSON.stringify(translation));
};
