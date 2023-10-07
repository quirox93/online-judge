import natural from "natural";

export const preprocessText = (_text: string): any => {
  const text = _text.toLowerCase().trim();
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "my",
    "i",
    "is",
    "no",
    "yes",
    "q",
  ]);
  const filteredTokens = tokens?.filter((token) => !stopWords.has(token));

  const stemmedTokens = filteredTokens?.map((token) =>
    natural.PorterStemmer.stem(token)
  );
  const preprocessedText = stemmedTokens?.join(" ");
  return { preprocessedText: preprocessedText || "", stemmedTokens };
};
export function parseCookies(cookieHeader: string | null) {
  const list = {} as any;
  if (!cookieHeader) return undefined;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}
