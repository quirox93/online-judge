import { useState, useEffect } from "react";
//import { navigate } from "astro:transitions/client";
import CardSearch from "./CardSearchEn.js";
export default function CardForm({ cardNumber }: { cardNumber: string }) {
  const startedCard = cardNumber ? { card_number: cardNumber } : null;
  const [card, setCard] = useState<any | null>(startedCard);
  // Start of Selection
  const [data, setData] = useState<any>({});
  const [message, setMessage] = useState<any>(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const cb = (cardData: any) => {
    if (cardData) setCard(cardData);

    // navigate(`/?card_number=${cardData.card_number}`);
    window.history.pushState({}, "", `/?card_number=${cardData.card_number}`);
  };
  const loadData = async () => {
    setMessage(
      <div className="flex flex-col gap-3 items-center">
        <p>Buscando precios de {card?.card_number}...</p>
        <img
          src="assets/loading.webp"
          alt="Cargando..."
          style={{
            backgroundColor: "transparent",
            borderRadius: "20%",
            width: "50%",
            height: "auto",
          }}
        />
      </div>
    );
    const cardDataFetch = await fetch(
      "/api/v1/prices?card_number=" + card?.card_number,
      {
        method: "GET",
      }
    );
    const cardData = await cardDataFetch.json();
    setData(cardData);
    setMessage(null);
  };
  useEffect(() => {
    if (card) loadData();
  }, [card]);

  const filtrarDisponibles = (cardData: any) =>
    soloDisponibles ? cardData.available : true;
  const [dolarWeb, ...webs] = data?.prices || [];
  const dolarBlue = dolarWeb?.blueVenta;
  const dataMap = webs?.map((web: any) => {
    const cardsMapped = web?.cards?.map((card: any) => {
      return { source: web.source, ...card };
    });
    return cardsMapped;
  });
  let flatDataMap = dataMap?.flat();
  if (dolarBlue)
    flatDataMap = flatDataMap.map((e: any) => {
      if (e?.price_ars) {
        e.price_usd = parseFloat((e.price_ars / dolarBlue).toFixed(2));
      }
      return e;
    });
  const sortedPrices = flatDataMap?.sort((a: any, b: any) => {
    const priceA = a.price_usd?.median_price || a.price_usd || Infinity;
    const priceB = b.price_usd?.median_price || b.price_usd || Infinity;
    return (
      (priceA === 0 ? Infinity : priceA) - (priceB === 0 ? Infinity : priceB)
    );
  });
  console.log(sortedPrices);
  const cardsMap =
    message ||
    sortedPrices
      ?.filter(filtrarDisponibles)
      ?.map((cardData: any, index: any) => (
        <article
          key={index}
          className={`w-[100%] p-2 gap-4 justify-items-center items-center flex flex-col lg:flex-row md:flex-row sm:flex-row`}
        >
          <a href={cardData?.image} target="_blank" rel="noreferrer">
            <img
              className={`w-[250px] p-2 max-w-xs  ${
                cardData?.available === false ? "border-2 border-red-500" : ""
              }`}
              src={cardData?.image || "/assets/digimon_cardback.webp"}
              alt={cardData?.title}
            ></img>
          </a>
          <div className="flex flex-col p-4 w-[100%] overflow-x-auto">
            <a
              href={cardData?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-500"
            >
              <h3 className="text-lg font-bold mb-4">{cardData?.title}</h3>
            </a>
            {Object.entries(cardData || {})
              .filter(
                ([key]) =>
                  key !== "image" &&
                  key !== "url" &&
                  key !== "title" &&
                  key !== "available"
              )
              .map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  {typeof value === "object" && value !== null ? (
                    <>
                      <strong>{key}:</strong>
                      <div className="ml-4">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between">
                            <span>{subKey}:</span>
                            <span>{String(subValue)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <strong>{key}:</strong>
                      <span>{String(value)}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </article>
      ));

  return (
    <>
      <CardSearch cb={cb} />
      <div className="flex items-center gap-2">
        <input
          id="soloDisponibles"
          type="checkbox"
          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 rounded"
          checked={soloDisponibles}
          onChange={(e) => setSoloDisponibles(e.target.checked)}
        />
        <label
          htmlFor="soloDisponibles"
          className="text-sm font-medium text-gray-300"
        >
          Solo disponibles
        </label>
      </div>
      {card && <div>{cardsMap}</div>}
    </>
  );
}
