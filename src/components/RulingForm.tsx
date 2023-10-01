import { useState } from "react";
import { Input } from "./ui/input.js";

export default function RulingForm({ data }: any) {
  const [card, setCard] = useState({} as any);
  const [inputValue, setInputValue] = useState("");

  const handleInput = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    const cardData = data.find(
      (e: any) => e.card_name + " " + e.card_number === value
    );
    if (cardData) setCard(cardData);
  };
  return (
    <>
      <div className="w-[100%] flex gap-4 items-center justify-center mb-5 ">
        <div className="flex flex-col w-[70%]">
          <Input
            placeholder="Search a card..."
            type="text"
            list="data"
            onChange={handleInput}
            value={inputValue}
          />
        </div>
      </div>
      {card?.card_name ? (
        <article className="flex flex-col items-center justify-center">
          <label>
            {card?.card_name} ({card?.card_number})
          </label>
          <img className="w-[30%]" src={card?.image_url}></img>
        </article>
      ) : (
        ""
      )}
      <datalist id="data">
        {data.map((e: any, i: number) => (
          <option
            key={e.card_number + "*" + i}
            value={e.card_name + " " + e.card_number}
          />
        ))}
      </datalist>
    </>
  );
}
