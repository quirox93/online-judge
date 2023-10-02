import { useState } from "react";
import { Input } from "./ui/input";

export default function CardSearch({ data, cb }: any) {
  const [inputValue, setInputValue] = useState("");
  const handleInput = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    const cardData = data.find(
      (e: any) => e.card_name + " " + e.card_number === value
    );
    cb(cardData);
  };
  return (
    <div className="w-[100%] flex gap-4 items-center justify-center mb-5 ">
      <div className="flex flex-col w-[70%]">
        <Input
          placeholder="Search a card..."
          type="text"
          list="data"
          onChange={handleInput}
          value={inputValue}
        />
        {inputValue.length > 2 && (
          <datalist id="data">
            {data.map((e: any, i: number) => (
              <option
                key={e.card_number + "*" + i}
                value={e.card_name + " " + e.card_number}
              />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}
