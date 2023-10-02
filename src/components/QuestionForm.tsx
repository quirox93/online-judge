import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Source, Value } from "@/interfaces/interfaces";
import { Textarea } from "./ui/textarea";
import React from "react";
import { Input } from "./ui/input";

export default function QuestionForm({ data }: any) {
  const [values, setValues] = useState<Value>({
    question: "",
    answer: "",
    sources: "",
  });
  const [inputValue, setInputValue] = useState("");
  const handleInput = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    const cardData = data.find(
      (e: any) => e.card_name + " " + e.card_number === value
    );
    console.log(cardData);
  };
  async function onSubmit(event: any) {
    event.preventDefault();
    const question = "Que es rush";
    try {
      setValues({ ...values, answer: "Cargando...", sources: "" });
      const response = await fetch("/api/answer", {
        method: "POST",
        body: JSON.stringify(question),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const { answer, sources } = data;
      const map = sources.map((e: Source) => {
        const similarity = Math.ceil(e.similarity * 100);
        const lines = e.content
          .trim()
          .split("\n")
          .map((line, i) => {
            return (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            );
          });
        return (
          <section
            className="p-3 bg-secondary rounded-md mb-10 opacity-75 hover:opacity-100"
            key={e.id}
          >
            <hr />
            <article>
              <h2 className=" text-xl ">
                #{e.id} [similarity: {similarity}%] {e.title}
              </h2>
              <p>{lines}</p>
            </article>
          </section>
        );
      });

      setValues({ ...values, sources: map, answer });
    } catch (error: any) {
      setValues({ ...values, sources: "", answer: error.message });
    }
  }

  const onTextChange = (e: any) => {
    const { value } = e.target;
    setValues({ ...values, question: value });
  };

  let disabled = false;
  if (values.answer === "Cargando...") disabled = true;

  const handleSelection = (card: any) => {
    console.log(card);
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
      <form className="w-[100%] flex items-center flex-col" onSubmit={onSubmit}>
        <Textarea
          onChange={onTextChange}
          className="bg-secondary w-[90%] mb-5"
          placeholder="Ask me..."
          value={values.question}
        />
        <Button disabled={disabled} className="w-[90%]" type="submit">
          Submit
        </Button>
      </form>
      <div className="flex justify-center w-full flex-col items-center  p-10">
        {values.answer && (
          <p className=" text-xl p-3 bg-secondary rounded-md mb-10">
            {values.answer}
          </p>
        )}
        {values.sources}
      </div>
    </>
  );
}
