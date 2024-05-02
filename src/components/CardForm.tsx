import { useState, useEffect } from "react";
import CardSearch from "./CardSearchEn.js";
import type { OficialData } from "@/interfaces/interfaces.js";
export default function CardForm() {
  const [card, setCard] = useState(null as OficialData | null);
  const [data, setData] = useState([] as any);
  const [message, setMessage] = useState<any>(null);
  const cb = (cardData: any) => {
    console.log(cardData);
    if (cardData) setCard(cardData);
  };

  useEffect(() => {
    const loadData = async () => {
      setMessage(<p className="w-[100%] text-center">Buscando precios...</p>);
      const cardDataFetch = await fetch("/api/data", {
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
  const cardsMap =
    message ||
    data.map((cardData: any, index: any) => (
      <article
        key={index}
        className={`w-[100%] gap-4 justify-items-center items-center flex ${"flex-col lg:flex-row md:flex-row sm:flex-row"}`}
      >
        <a href={cardData?.url} target="_blank" rel="noreferrer">
          <img
            className="w-[100%] p-4 max-w-xs  "
            src={cardData?.image}
            alt={cardData?.title}
          ></img>
        </a>
        <pre className="flex flex-col p-4 gap-8 w-[100%] overflow-x-auto">
          {JSON.stringify(cardData, null, 2)}
        </pre>
      </article>
    ));
  return (
    <>
      <CardSearch cb={cb} />
      {card && <div>{cardsMap}</div>}
    </>
  );
}
