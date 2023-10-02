import { useState } from "react";
import { Input } from "./ui/input.js";
import CardSearch from "./CardSearch.js";

export default function RulingForm({ data }: any) {
  const [card, setCard] = useState({} as any);

  const cb = (cardData: any) => {
    if (cardData) setCard(cardData);
  };
  return (
    <>
      <CardSearch cb={cb} data={data} />
      {card?.card_name ? (
        <article className="flex flex-col items-center justify-center">
          <label>
            {card?.card_name} ({card?.card_number})
          </label>
          <img className="w-[30%] " src={card?.image_url}></img>
        </article>
      ) : (
        ""
      )}
    </>
  );
}
