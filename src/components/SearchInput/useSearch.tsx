import { useState, useEffect } from "react";

const useSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [stringSearch, setStringSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [cache, setCache] = useState({} as { [key: string]: any });
  const [isLoading, setIsLoading] = useState(false);

  const onLostFocus = () => {
    setIsFocus(false);
  };
  const onFocus = () => {
    setIsFocus(true);
  };

  const hidden =
    !isFocus || inputValue.length < 3 || !searchResult.length ? "hidden" : "";

  const fetchCard = async (cardName: string) => {
    if (cardName.length < 3) return setSearchResult([]);
    if (cache[cardName]) {
      setSearchResult(cache[cardName]);
      return;
    }
    if (cache[stringSearch]?.length < 20 && cardName.includes(stringSearch)) {
      setSearchResult(
        cache[stringSearch].filter((e: any) =>
          e.card_name.toLowerCase().includes(cardName.toLowerCase())
        )
      );
      return;
    }
    setIsLoading(true);
    setStringSearch(cardName);
    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ cardName }),
    });
    const {
      data: {
        success: { cards },
      },
    } = await response.json();
    setSearchResult(cards);
    setCache({ ...cache, [cardName]: cards });
    setIsLoading(false);
  };

  useEffect(() => {
    updateList(inputValue);
  }, [isLoading]);

  const onInputChange = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    updateList(value);
  };

  const updateList = (value: string) => {
    if (!isLoading && stringSearch !== inputValue) {
      fetchCard(value);
    }
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
    // También puedes agregar otras funciones o valores que necesites en tu componente
  };
};

export default useSearch;
