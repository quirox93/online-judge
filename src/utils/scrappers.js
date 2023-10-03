import * as cheerio from "cheerio";

export async function getCardRulingJp(cardNumber) {
  const response = await fetch(
    "https://digimoncard.com/rule/?card_no=" + cardNumber
  );
  const html = await response.text();
  const $ = cheerio.load(html);
  const span = $(".qaResult")[0];
  const questions = $(span).find(".questions").find("dd");
  const answers = $(span).find(".answer").find("dd");
  const q = [];
  const a = [];
  questions.each((i, el) => {
    const text = $(el)
      .html()
      .replace("<br>", "\n")
      .replace("<span>", "")
      .replace("</span>", "")
      .trim();
    q.push(text);
  });

  answers.each((i, el) => {
    const text = $(el)
      .html()
      .replace("<br>", "\n")
      .replace("<span>", "")
      .replace("</span>", "")
      .trim();
    a.push(text);
  });

  const qa = q.map((question, i) => {
    return { question, answer: a[i] };
  });
  return qa;
}
