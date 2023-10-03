import { useState, useEffect } from "react";
import CardSearch from "./CardSearch.js";
import type { OficialData } from "@/interfaces/interfaces.js";
import { getCardRulingJp } from "@/utils/scrappers.js";

export default function RulingForm() {
  const [card, setCard] = useState(null as OficialData | null);
  const [rulings, setRulings] = useState([] as any);
  const cb = (cardData: any) => {
    if (cardData) setCard(cardData);
  };

  useEffect(() => {
    const loadRuling = async () => {
      const data = await getCardRulingJp(card?.card_number);
      setRulings(data);
    };
    if (card) loadRuling();
  }, [card]);

  const rulingsMap = rulings.map((r: any, i: number) => (
    <span key={"r" + i}>
      <p>${r.question}</p>
      <p>${r.answer}</p>
      <hr></hr>
    </span>
  ));
  return (
    <>
      <CardSearch cb={cb} />
      {card && (
        <article className="flex flex-col gap-4 items-center justify-center">
          <label>
            {card?.card_name} ({card?.card_number})
          </label>
          <img className="w-[30%] " src={card?.image_url}></img>
          <div className="flex flex-col gap-4">{rulingsMap}</div>
        </article>
      )}
    </>
  );
}
