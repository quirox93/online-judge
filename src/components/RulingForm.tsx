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
      const ruleData = await getCardRulingJp(card?.card_number);
      setRulings(ruleData);
      /*
      const token = localStorage.getItem("supabase.auth.token");

      const response = await fetch("/api/translator", {
        method: "POST",
        body: JSON.stringify({ text: JSON.stringify(ruleData), token }),
      });
      const data = await response.json();
      if (data.error) return alert(data.error);

      const { translation } = data;
      console.log(translation);
      setRulings(JSON.parse(translation));*/

      const responses = await Promise.all(
        ruleData.map((rule) =>
          fetch("/api/gtranslator", {
            method: "POST",
            body: JSON.stringify({ text: rule }),
          })
        )
      );

      const dataPromises = responses.map((response) => response.json());
      const dataArray = await Promise.all(dataPromises);
      console.log(dataArray);
      setRulings(dataArray);
    };
    if (card) loadRuling();
  }, [card]);

  const rulingsMap = rulings.map((r: any, i: number) => (
    <span key={"r" + i}>
      <p>Q: {r.question}</p>
      <p>A: {r.answer}</p>
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
