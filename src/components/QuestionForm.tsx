import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { OficialData, Source, Value } from "@/interfaces/interfaces";
import { Textarea } from "./ui/textarea";
import React from "react";
import CardSearch from "./CardSearch";

export default function QuestionForm() {
  const [values, setValues] = useState<Value>({
    question: "",
    answer: "",
    sources: "",
  });

  const [cardRef, setCardRef] = useState([] as OficialData[]);

  async function onSubmit(event: any) {
    event.preventDefault();

    const token = localStorage.getItem("supabase.auth.token");

    try {
      setValues({ ...values, answer: "Cargando...", sources: "" });

      const $cardRef = new Set(
        cardRef.filter((data) => values.question?.includes(data.card_number))
      );

      const response = await fetch("/api/answer", {
        method: "POST",
        body: JSON.stringify({
          question: values.question,
          token,
          cardRef: [...$cardRef],
        }),
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

  const cb = (card: OficialData) => {
    setValues({
      ...values,
      question: `${values.question} [${card.card_name} ${card.card_number}]`,
    });
    setCardRef([...cardRef, card]);
  };

  return (
    <>
      <CardSearch cb={cb} />
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
            {values.answer
              .trim()
              .split("\n")
              .map((line, i) => {
                return (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                );
              })}
          </p>
        )}
        {values.sources}
      </div>
    </>
  );
}
