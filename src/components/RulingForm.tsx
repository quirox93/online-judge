import { useState, useEffect } from "react";
import CardSearch from "./CardSearch.js";

export default function RulingForm() {
  const [card, setCard] = useState({} as any);

  const cb = (cardData: any) => {
    if (cardData) setCard(cardData);
  };

  return (
    <div>
      <CardSearch cb={cb} />
      <article className="flex flex-col items-center justify-center">
        <label>
          {card?.card_name} ({card?.card_number})
        </label>
        <img className="w-[30%] " src={card?.image_url}></img>
      </article>
    </div>
  );
}
