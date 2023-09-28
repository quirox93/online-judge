import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Source, Value } from "@/interfaces/interfaces";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  question: z
    .string()
    .min(5, {
      message: "Question must be at least 5 characters.",
    })
    .max(400, {
      message: "Question must be max 400 characters.",
    }),
});
export default function QuestionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const [values, setValues] = useState<Value>({
    question: "",
    answer: "",
    sources: "",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setValues({ ...values, answer: "Cargando...", sources: "" });
      const response = await fetch("/api/answer", {
        method: "POST",
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const { answer, sources } = data;
      const map = sources.map((e: Source) => {
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
          <section className="p-3 bg-secondary rounded-md mb-10 opacity-75 hover:opacity-100" key={e.id}>
            <hr />
            <article>
              <h2 className=" text-xl ">
                #{e.id} {e.title}
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
  let disabled = false;
  if (values.answer === "Cargando...") disabled = true;
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" w-full flex flex-col items-center justify-center gap-3"
        >
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem className="w-[90%]">
                <FormControl>
                  <Textarea
                    className="bg-secondary"
                    placeholder="Ask me..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={disabled} className="w-[90%]" type="submit">
            Submit
          </Button>
        </form>
      </Form>
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
