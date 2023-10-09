import { useState, useEffect, Suspense } from "react";
import CardSearch from "./CardSearch.js";
import type { OficialData } from "@/interfaces/interfaces.js";
import { getCardRulingJp } from "@/utils/scrappers.js";
export default function RulingForm() {
  const [card, setCard] = useState(null as OficialData | null);
  const [rulings, setRulings] = useState([] as any);
  const [ruleMessage, setRuleMessage] = useState("");
  const cb = (cardData: any) => {
    if (cardData) setCard(cardData);
  };

  useEffect(() => {
    const loadRuling = async () => {
      setRuleMessage("Searching rulings..");
      const ruleData = await fetch("/api/ruling", {
        method: "POST",
        body: JSON.stringify({ card_number: card?.card_number }),
      });
      const rules = await ruleData.json();
      setRulings(rules);
      setRuleMessage("");
      const responses = await Promise.all(
        rules.map((rule: any) =>
          fetch("/api/gtranslator", {
            method: "POST",
            body: JSON.stringify({ text: rule }),
          })
        )
      );

      const dataPromises = responses.map((response) => response.json());
      const dataArray = await Promise.all(dataPromises);
      setRulings(dataArray);

      /*const token = localStorage.getItem("supabase.auth.token");
      if (!token) return;
      const response = await fetch("/api/translator", {
        method: "POST",
        body: JSON.stringify({ text: JSON.stringify(ruleData), token }),
      });
      const data = await response.json();
      //if (data.error) return alert(data.error);
      if (!data.error) {
        const { translation } = data;
        setRulings(JSON.parse(translation));
      }*/
    };
    if (card) loadRuling();
  }, [card]);

  const rulingsMap = rulings.map((r: any, i: number) => (
    <span className="p-4 bg-slate-600 rounded-sm m-4" key={"r" + i}>
      <p>
        <span className={"text-green-500 font-bold "}>Q:</span> {r.question}
      </p>
      <p>
        <span className={"text-red-500 font-bold "}>A:</span> {r.answer}
      </p>
    </span>
  ));
  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))",

    /* Otros estilos aquí */
  };

  return (
    <>
      <CardSearch cb={cb} />
      {card && (
        <article
          style={gridStyles}
          className={`w-[100%] gap-4 justify-items-center`}
        >
          <img className="w-[100%] p-4 max-w-xs  " src={card?.image_url}></img>
          <div className="flex flex-col p-4 gap-8">
            {ruleMessage || rulingsMap}
          </div>
        </article>
      )}
    </>
  );
}
