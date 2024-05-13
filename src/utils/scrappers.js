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
const WEBS = {
  tcgPlayer: getTcgPlayer,
  phoenix: getPhoenix,
  guarida: getGuaridaDelElfo,
  spaceGaming: getSpaceGaming,
  dolarBlue: fetchDolarValue,
};
export async function getPriceData(cardNumber, filters) {
  try {
    const promises = filters.map((e) => WEBS[e](cardNumber)); // Corregir el uso de map
    const allPrices = await Promise.all(promises);

    return allPrices;
  } catch (error) {
    console.error(error);
    return { error: error.message }; // Devolver un array vacío en caso de error
  }
}
async function fetchDolarValue() {
  const start = new Date().getTime();
  const dolarResponse = await fetch("https://dolarapi.com/v1/dolares/blue");
  const dolarData = await dolarResponse.json();
  const end = new Date().getTime();
  const durationMs = end - start;
  return { blueVenta: dolarData.venta, durationMs };
}
async function getTcgPlayer(cardNumber) {
  try {
    cardNumber = cardNumber.toUpperCase();
    const start = new Date().getTime();
    const url =
      "https://mp-search-api.tcgplayer.com/v1/search/request?q=&isList=false&mpfev=2372";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: `{"algorithm":"sales_synonym_v2","from":0,"size":24,"filters":{"term":{"productLineName":["digimon-card-game"],"productTypeName":["Cards"],"number":["${cardNumber} C","${cardNumber} U","${cardNumber} R","${cardNumber} SR","${cardNumber} SEC","${cardNumber} P"]}}}`,
    };

    const response = await fetch(url, options);
    const data = await response.json();
    const { results } = data.results[0];

    const resultPromises = results.map(async (e) => {
      const priceResponse = await fetch(
        `https://mpapi.tcgplayer.com/v2/product/${e.productId}/pricepoints`
      );
      const priceData = await priceResponse.json();
      const prices = priceData.filter(
        (p) => p.marketPrice || p.listedMedianPrice
      );
      const price_usd = {
        market_price: prices[0].marketPrice,
        median_price: prices[0].listedMedianPrice,
      };
      return {
        source: "TCG Player",
        title: e.productName,
        url: `https://www.tcgplayer.com/product/${e.productId}`,
        image: `https://product-images.tcgplayer.com/fit-in/437x437/${e.productId}.jpg`,
        available: Boolean(e.listings.length),
        price_usd,
      };
    });

    const cards = await Promise.all(resultPromises);
    const end = new Date().getTime();
    const durationMs = end - start;
    return { source: "TCG Player", cards, durationMs };
  } catch (error) {
    console.error(error);
    return { source: "TCG Player", error };
  }
}
async function getPhoenix(cardNumber) {
  try {
    cardNumber = cardNumber.toUpperCase();
    const start = new Date().getTime();

    // OBTENGO PRECIOS DESDE API DE PHOENIX
    const url = "https://phoenixreborn.com.ar/wp-admin/admin-ajax.php";
    const form = new FormData();
    form.append("action", "aws_action");
    form.append("keyword", cardNumber);
    form.append("typedata", "json");
    form.append("pageurl", "https://phoenixreborn.com.ar/");

    const options = { method: "POST" };

    options.body = form;

    const response = await fetch(url, options);
    const { products } = await response.json();
    const data = products.filter((e) =>
      e.post_data?.post_title.includes(cardNumber)
    );
    if (!data.length) return [];
    const cards = data.map((cardData) => {
      return {
        title: cardData.title,
        url: "https://phoenixreborn.com.ar/?p=" + cardData.post_data.ID,
        image: cardData.image?.replace("-150x150", "") || undefined,
        available: cardData.f_stock,
        price_ars: Math.floor(cardData.f_price),
      };
    });
    const end = new Date().getTime();
    const durationMs = end - start;

    return { source: "Phoenix Reborn", cards, durationMs };
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getGuaridaDelElfo(cardNumber) {
  try {
    cardNumber = cardNumber.toUpperCase();
    const start = new Date().getTime();
    const url =
      "https://www.laguaridadelelfo.com.ar/search/?q=" +
      cardNumber +
      "&limit=10&snipplet=search-results.tpl";
    const options = { method: "GET" };

    const response = await fetch(url, options);
    const html = await response.text();
    const $ = cheerio.load(html);

    const scriptData = $('script[type="application/ld+json"]')
      .map((i, el) => JSON.parse($(el).html()))
      .get();

    const cardsData = scriptData.filter((e) =>
      e.name.includes("(" + cardNumber + ")")
    );
    const cards = cardsData.map((e) => {
      return {
        title: e.name,
        image: e.image.includes("no-photo") ? undefined : e.image,
        url: e.offers.url,
        available: e.offers.availability == "http://schema.org/InStock",
        price_ars: Number(e.offers.price),
      };
    });

    const end = new Date().getTime();
    const durationMs = end - start;
    return { source: "La guarida del elfo", cards, durationMs };
  } catch (error) {
    console.error(error);
    return [{ source: "La guarida del elfo", error }];
  }
}
async function getSpaceGaming(cardNumber) {
  try {
    const start = new Date().getTime();
    const cardListResponse = await fetch(
      "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=1000&offset=0&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false&card_number=" +
        cardNumber
    );
    const { success } = await cardListResponse.json();
    const cardName = success?.cards[0]?.card_name.replace(/[^\w\s]/gi, "");

    const url =
      "https://spacegaminglomas.com/?post_type=product&s=" +
      cardName +
      "+" +
      cardNumber.split("-")[0].replace(/[0-9]/g, "") +
      "&product_cat=digimon";
    const options = { method: "GET" };

    const response = await fetch(url, options);
    const html = await response.text();
    const $ = cheerio.load(html);
    let products = $(".wp-post-image");
    let cards = [];
    if (products.length) {
      cards = getSpaceGamingSingleData($, products, cardNumber);
    } else {
      cards = getSpaceGamingData($, cardNumber);
      const pageNumbers = $(".page-numbers")
        .map((i, el) => $(el).attr("href"))
        .get();
      if (pageNumbers.length) {
        const newPages = await Promise.all(
          pageNumbers
            .slice(0, -1)
            .map((pageNumber) => getSpaceGamingPage(pageNumber, cardNumber))
        );
        console.log(newPages);
        cards = [...cards, ...newPages.flat()];
      }
    }
    const end = new Date().getTime();
    const durationMs = end - start;
    return { source: "SpaceGamingLomas", cards, durationMs };
  } catch (error) {
    console.error(error);
    return { source: "SpaceGamingLomas", error };
  }
}
async function getSpaceGamingPage(url, cardNumber) {
  try {
    const options = { method: "GET" };

    const response = await fetch(url, options);
    const html = await response.text();
    const $ = cheerio.load(html);
    return getSpaceGamingData($, cardNumber);
  } catch (error) {
    console.error(error);
    return [];
  }
}
function getSpaceGamingData($, cardNumber) {
  try {
    let mapped = [];
    let products = $(".attachment-woocommerce_thumbnail");
    mapped = products
      .map((i, el) => {
        const title = $(el).parent().parent().text();
        const image = $(el).get(0).attribs.src;
        const url =
          "https://spacegaminglomas.com/?p=" +
          $(el)
            .parent()
            .parent()
            .parent()
            .find(".product_type_simple")
            .attr("data-product_id");
        const available = !$(el)
          .parent()
          .parent()
          .parent()
          .text()
          .includes("Leer más");
        const price_ars = parseInt(
          $(el)
            .parent()
            .parent()
            .parent()
            .find(".price")
            .text()
            .substring(2)
            .replace(".", "")
            .replace(",", ".")
        );

        return {
          title,
          url,
          image,
          available,
          price_ars,
        };
      })
      .get();

    const filtered = mapped.filter((obj) =>
      obj.image.toLowerCase().includes(cardNumber.toLowerCase())
    );
    return filtered;
  } catch (error) {
    console.error(error);
    return [];
  }
}
function getSpaceGamingSingleData($, products, cardNumber) {
  try {
    const summary = $(".entry-summary")?.first();
    let product = products?.first();
    const image = product?.get(0).attribs.src;
    const title = summary.find(".product_title").text();
    const available = !summary.find(".out-of-stock").length;
    const url = $('link[rel="shortlink"]').attr("href");

    const price_ars = parseInt(
      summary
        .find(".woocommerce-Price-amount")
        .text()
        .substring(2)
        .replace(".", "")
        .replace(",", ".")
    );
    const cards = [
      {
        title,
        url,
        image,
        available,
        price_ars,
      },
    ].filter((obj) =>
      obj.image.toLowerCase().includes(cardNumber.toLowerCase())
    );
    return cards;
  } catch (error) {
    console.error(error);
    return [];
  }
}
