import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { allCards } from "@/store/store.js";
import { useStore } from "@nanostores/react";
import { SkeletonSearch } from "./ui/skeletonSearch";
import type { OficialData } from "@/interfaces/interfaces";
const loadData = async () => {
  const URLs = [
    "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=1000&offset=0&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
    "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=1000&offset=1000&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
    "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=1000&offset=2000&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
    "https://api.bandai-tcg-plus.com/api/user/card/list?infinite=false&reverse_card=0&playable_regulation%5B%5D=12&default_regulation=12&offset=0&game_title_id=6&limit=1000",
    "https://api.bandai-tcg-plus.com/api/user/card/list?infinite=false&reverse_card=0&playable_regulation%5B%5D=12&default_regulation=12&offset=2000&game_title_id=6&limit=1000",
    "https://api.bandai-tcg-plus.com/api/user/card/list?infinite=false&reverse_card=0&playable_regulation%5B%5D=12&default_regulation=12&offset=3000&game_title_id=6&limit=1000",
  ];

  // Usamos Promise.all para realizar las tres llamadas en paralelo
  const responses = await Promise.all(URLs.map((url) => fetch(url)));

  // Procesamos los resultados de cada llamada
  const dataPromises = responses.map((response) => response.json());
  const dataArray = await Promise.all(dataPromises);
  const data = dataArray.flatMap((obj) => obj.success.cards) as
    | OficialData[]
    | any;
  const uniqueNumbers = new Set(
    data.map((cardData: OficialData) => cardData.card_number)
  );
  const filterData = [...uniqueNumbers].map((cardNumber) => {
    const find = data.find((d: OficialData) => d.card_number === cardNumber);
    return find;
  });
  allCards.set(filterData);
  return filterData;
};

export default function CardSearch({ cb }: any) {
  const [inputValue, setInputValue] = useState("");

  const data = useStore(allCards);
  useEffect(() => {
    if (!data.length) loadData();
  }, []);

  const handleInput = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    const cardData = data.find(
      (c) => c.card_name + " " + c.card_number == value
    );
    if (cardData) cb(cardData);
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
            {data.map((e, i: number) => (
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
