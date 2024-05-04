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

async function fetchDolarValue() {
  const dolarResponse = await fetch("https://dolarapi.com/v1/dolares/blue");
  const dolarData = await dolarResponse.json();
  return dolarData.venta;
}

export async function getPriceData(cardNumber) {
  try {
    const [tcgPlayer, phoenix, guarida, spaceGaming, dolarBlue] =
      await Promise.all([
        getTcgPlayer(cardNumber),
        getPhoenix(cardNumber),
        getGuaridaDelElfo(cardNumber),
        getSpaceGaming(cardNumber),
        fetchDolarValue(),
      ]);

    const allPrices = [...tcgPlayer, ...phoenix, ...guarida, ...spaceGaming];
    const fixedPrices = allPrices.map((e) => {
      if (e.price_ars) {
        e.price_usd = parseFloat((e.price_ars / dolarBlue).toFixed(2));
      }
      return e;
    });
    const sortedPrices = fixedPrices.sort((a, b) => {
      const priceA = a.price_usd?.median_price || a.price_usd || Infinity;
      const priceB = b.price_usd?.median_price || b.price_usd || Infinity;
      return (
        (priceA === 0 ? Infinity : priceA) - (priceB === 0 ? Infinity : priceB)
      );
    });
    return sortedPrices;
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getTcgPlayer(cardNumber) {
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

  try {
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

    const result = await Promise.all(resultPromises);
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getPhoenix(cardNumber, dolarValue) {
  try {
    // OBTENGO PRECIOS DESDE API DE PHOENIX
    const url =
      "https://phoenixreborn.com.ar/?wc-ajax=aws_action&https=%2F%2Fphoenixreborn.com.ar%2F%3Fwc-ajax";
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
    const cardsMap = data.map((cardData) => {
      return {
        source: "Phoenix Reborn",
        title: cardData.post_data.post_title,
        url: cardData.link,
        image: cardData.image.replace("-150x150", "") || undefined,
        available: cardData.f_stock,
        price_ars: Math.floor(cardData.f_price),
      };
    });
    return cardsMap;
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getGuaridaDelElfo(cardNumber, dolarValue) {
  try {
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
    const cardsMap = cardsData.map((e) => {
      return {
        source: "La guarida del elfo",
        title: e.name,
        image: e.image.includes("no-photo") ? undefined : e.image,
        url: e.offers.url,
        available: e.offers.availability == "http://schema.org/InStock",
        price_ars: Number(e.offers.price),
      };
    });
    return cardsMap;
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getSpaceGaming(cardNumber) {
  try {
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
    if (products.length)
      return getSpaceGamingSingleData($, products, cardNumber);

    let mapped = getSpaceGamingData($, cardNumber);
    const pageNumbers = $(".page-numbers")
      .map((i, el) => $(el).attr("href"))
      .get();
    console.log(pageNumbers);
    if (pageNumbers.length) {
      const newPages = await Promise.all(
        pageNumbers
          .slice(0, -1)
          .map((pageNumber) => getSpaceGamingPage(pageNumber, cardNumber))
      );
      console.log(newPages);
      return [...mapped, ...newPages.flat()];
    }
    return mapped;
  } catch (error) {
    console.error(error);
    return [];
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
        const url = $(el).parent().parent().get(0).attribs.href;
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
          source: "SpaceGamingLomas",
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
    const post_id = summary.find(".current-product-id").val();
    const title = summary.find(".product_title").text();
    const available = !summary.find(".out-of-stock").length;

    const price_ars = parseInt(
      summary
        .find(".woocommerce-Price-amount")
        .text()
        .substring(2)
        .replace(".", "")
        .replace(",", ".")
    );
    return [
      {
        source: "SpaceGamingLomas",
        title,
        url: "https://spacegaminglomas.com/?p=" + post_id,
        image,
        available,
        price_ars,
      },
    ].filter((obj) =>
      obj.image.toLowerCase().includes(cardNumber.toLowerCase())
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}
