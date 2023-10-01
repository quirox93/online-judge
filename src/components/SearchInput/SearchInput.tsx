import { Input } from "../ui/input";
import DigimonSearchCard from "./DigimonSearchCard";
import useSearch from "./useSearch";
export default function SearchInput({ handleSelection }: any) {
  const {
    inputValue,
    setInputValue,
    onFocus,
    onLostFocus,
    searchResult,
    hidden,
    onInputChange,
  } = useSearch();

  const mapResult = searchResult.map((card: any) => {
    return (
      <DigimonSearchCard
        setInputValue={setInputValue}
        card={card}
        handleSelection={handleSelection}
        key={card.id}
      />
    );
  });

  return (
    <div className="w-[100%] flex gap-4 items-center justify-center mb-5 ">
      <div className="flex flex-col w-[70%]">
        <Input
          placeholder="Search a card..."
          onChange={onInputChange}
          onBlur={onLostFocus}
          onFocus={onFocus}
          value={inputValue}
          type="text"
        />
        <div className={`relative  ${hidden} hover:block`}>
          <ol className="bg-secondary absolute w-[100%] p-2  border-white border-2 justify-center">
            {mapResult}
          </ol>
        </div>
      </div>
    </div>
  );
}
