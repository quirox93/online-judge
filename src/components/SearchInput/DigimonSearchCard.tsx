import { useState } from "react";

export default function DigimonSearchCard({
  handleSelection,
  card,
  setInputValue,
}: any) {
  const [hidden, setHidden] = useState("");
  const handleClick = () => {
    handleSelection(card);
    setHidden("hidden");
    setInputValue("");
  };
  return (
    <li className={`flex ${hidden}`} onClick={handleClick}>
      {card.card_name} ({card.card_number})
    </li>
  );
}
