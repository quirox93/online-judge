import { useState } from "react";
import SearchInput from "./SearchInput/SearchInput.jsx";

export default function RulingForm(data: any) {
  const [card, setCard] = useState({} as any);
  const handleSelection = (card: any) => {
    console.log(card);
    setCard(card);
  };
  return (
    <>
      <SearchInput handleSelection={handleSelection} data={data.data} />
      <article>{card?.card_name}</article>
    </>
  );
}
