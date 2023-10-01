export default function DigimonSearchCard({
  handleSelection,
  card,
  setInputValue,
  setSearchResult,
}: any) {
  const handleClick = () => {
    handleSelection(card);
    setInputValue("");
    setSearchResult([]);
  };
  return (
    <li onClick={handleClick}>
      {card.card_name} ({card.card_number})
    </li>
  );
}
