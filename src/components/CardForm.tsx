import { useState, useEffect } from "react";
import CardSearch from "./CardSearchEn.js";
import type { OficialData } from "@/interfaces/interfaces.js";
export default function CardForm() {
  const [card, setCard] = useState<OficialData | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [message, setMessage] = useState<any>(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const cb = (cardData: any) => {
    console.log(cardData);
    if (cardData) setCard(cardData);
  };

  useEffect(() => {
    const loadData = async () => {
      setMessage(<p className="w-[100%] text-center">Buscando precios...</p>);
      const cardDataFetch = await fetch("/api/v1/prices", {
        method: "POST",
        body: JSON.stringify({
          card_number: card?.card_number,
          card_name: card?.card_name,
        }),
      });
      const cardData = await cardDataFetch.json();
      setData(cardData);
      setMessage(null);
    };
    if (card) loadData();
  }, [card]);

  const filtrarDisponibles = (cardData: any) =>
    soloDisponibles ? cardData.available : true;

  const cardsMap =
    message ||
    data.filter(filtrarDisponibles).map((cardData: any, index: any) => (
      <article
        key={index}
        className={`w-[100%] p-2 gap-4 justify-items-center items-center flex flex-col lg:flex-row md:flex-row sm:flex-row`}
      >
        <a href={cardData?.image} target="_blank" rel="noreferrer">
          <img
            className={`w-[250px] p-2 max-w-xs ${
              cardData?.available === false ? "border-2 border-red-500" : ""
            }`}
            src={cardData?.image || "/assets/digimon_cardback.webp"}
            alt={cardData?.title}
          ></img>
        </a>
        <div className="flex flex-col p-4 w-[100%] overflow-x-auto">
          <a
            href={cardData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-500"
          >
            <h3 className="text-lg font-bold mb-4">{cardData.title}</h3>
          </a>
          {Object.entries(cardData)
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
                          <span>{subValue.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <strong>{key}:</strong>
                    <span>{value.toString()}</span>
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
