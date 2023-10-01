import { useState } from "react";

const useSearch = (data: any) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [searchResult, setSearchResult] = useState([] as any);

  const onLostFocus = () => {
    setIsFocus(false);
  };
  const onFocus = () => {
    setIsFocus(true);
  };

  const hidden =
    !isFocus || inputValue.length < 3 || !searchResult.length ? "hidden" : "";

  const onInputChange = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    const newSearchResults = data.filter((e: any) => {
      const fullname = (e.card_name + " " + e.card_number).toLocaleLowerCase();
      const valueParts = value.toLocaleLowerCase().split(" ");
      return valueParts.every((part: string) => fullname.includes(part));
    });
    setSearchResult(newSearchResults);
  };

  // Aquí puedes definir funciones o lógica relacionada con estos estados si es necesario

  return {
    inputValue,
    setInputValue,
    onFocus,
    onLostFocus,
    searchResult,
    hidden,
    onInputChange,
    setSearchResult,
    // También puedes agregar otras funciones o valores que necesites en tu componente
  };
};

export default useSearch;
