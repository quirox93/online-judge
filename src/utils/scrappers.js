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

export async function getPriceData(cardNumber, cardName) {
  try {
    const dolarResponse = await fetch("https://dolarapi.com/v1/dolares/blue");
    const dolarData = await dolarResponse.json();
    const dolarValue = dolarData.venta;
    const [tcgPlayer, phoenix, guarida, spaceGaming] = await Promise.all([
      getTcgPlayer(cardNumber),
      getPhoenix(cardNumber, dolarValue),
      getGuaridaDelElfo(cardNumber, dolarValue),
      getSpaceGaming(cardNumber, cardName, dolarValue),
    ]);

    const allPrices = [...tcgPlayer, ...phoenix, ...guarida, ...spaceGaming];
    const sortedPrices = allPrices.sort((a, b) => {
      const priceA = a.price_usd || a.medianPrice_usd || a.marketPrice_usd;
      const priceB = b.price_usd || b.medianPrice_usd || b.marketPrice_usd;
      return priceA - priceB;
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
    const result = results.map((e) => {
      return {
        source: "TCG Player",
        title: e.productUrlName,
        url: `https://www.tcgplayer.com/product/${e.productId}`,
        image: `https://product-images.tcgplayer.com/fit-in/437x437/${e.productId}.jpg`,
        marketPrice_usd: e.marketPrice,
        medianPrice_usd: e.medianPrice,
        available: Boolean(e.listings.length),
      };
    });

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
    console.log(products);
    const data = products.filter((e) =>
      e.post_data?.post_title.includes(cardNumber)
    );
    console.log(data);
    if (!data.length) return [];
    const cardsMap = data.map((cardData) => {
      return {
        source: "Phoenix Reborn",
        title: cardData.post_data.post_title,
        url: cardData.link,
        price_ars: Math.floor(cardData.f_price),
        price_usd: parseFloat((cardData.f_price / dolarValue).toFixed(2)),
        image: cardData.image.replace("-150x150", ""),
        available: cardData.f_stock,
        last_update: cardData.post_data.post_modified,
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
    console.log(cardsData);

    const cardsMap = cardsData.map((e) => {
      if (e.offers.availability !== "http://schema.org/InStock") return null;
      return {
        source: "La guarida del elfo",
        title: e.name,
        image: e.image,
        url: e.offers.url,
        price_ars: Number(e.offers.price),
        price_usd: e.offers.price / dolarValue,
        available: e.offers.availability == "http://schema.org/InStock",
      };
    });

    return cardsMap.filter(Boolean);
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getSpaceGaming(cardNumber, cardName, dolarValue) {
  try {
    console.log(cardName);
    const url =
      "https://spacegaminglomas.com/?post_type=product&s=" +
      cardName +
      "+" +
      cardNumber.split("-")[0].replace(/[0-9]/g, "") +
      "&product_cat=digimon";
    console.log(url);
    const options = { method: "GET" };

    const response = await fetch(url, options);
    const html = await response.text();
    const $ = cheerio.load(html);
    let products = $(".wp-post-image");
    let mapped = [];
    if (products.length) {
      const summary = $(".entry-summary")?.first();
      let product = products?.first();
      const image = product?.get(0).attribs.src;
      console.log(image);
      const _url = "";
      const title = summary.find(".product_title").text();

      const price_ars = parseInt(
        summary
          .find(".woocommerce-Price-amount")
          .text()
          .substring(2)
          .replace(".", "")
          .replace(",", ".")
      );
      console.log(price_ars);
      const price_usd = parseFloat((price_ars / dolarValue).toFixed(2));
      mapped = [
        {
          source: "SpaceGamingLomas",
          title,
          url,
          image,
          price_ars,
          price_usd,
        },
      ];

      console.log(mapped);
    } else {
      products = $(".attachment-woocommerce_thumbnail");
      mapped = products
        .map((i, el) => {
          const title = $(el).parent().parent().text();
          const image = $(el).get(0).attribs.src;
          const url = $(el).parent().parent().get(0).attribs.href;
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
          const price_usd = parseFloat((price_ars / dolarValue).toFixed(2));
          return {
            source: "SpaceGamingLomas",
            title,
            url,
            image,
            price_ars,
            price_usd,
          };
        })
        .get();
    }
    let filtered = mapped.filter((obj) =>
      obj.image.toLowerCase().includes(cardNumber.toLowerCase())
    );
    console.log(filtered);
    const pageNumbers = $(".page-numbers")
      .map((i, el) => $(el).attr("href"))
      .get();
    if (pageNumbers.length) {
      const newPages = await Promise.all(
        pageNumbers
          .slice(0, -1)
          .map((pageNumber) =>
            getSpaceGamingPage(pageNumber, cardNumber, cardName, dolarValue)
          )
      );
      filtered = [...filtered, ...newPages.flat()];
    }
    console.log(filtered);
    return filtered;
  } catch (error) {
    console.error(error);
    return [];
  }
}
async function getSpaceGamingPage(url, cardNumber, cardName, dolarValue) {
  try {
    const options = { method: "GET" };

    const response = await fetch(url, options);
    const html = await response.text();
    const $ = cheerio.load(html);
    let products = $(".wp-post-image");
    let mapped = [];
    products = $(".attachment-woocommerce_thumbnail");
    mapped = products
      .map((i, el) => {
        const title = $(el).parent().parent().text();
        const image = $(el).get(0).attribs.src;
        const url = $(el).parent().parent().get(0).attribs.href;
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
        const price_usd = parseFloat((price_ars / dolarValue).toFixed(2));
        return {
          source: "SpaceGamingLomas",
          title,
          url,
          image,
          price_ars,
          price_usd,
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
