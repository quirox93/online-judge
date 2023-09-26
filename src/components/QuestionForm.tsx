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

const formSchema = z.object({
  question: z
    .string()
    .min(5, {
      message: "Question must be at least 5 characters.",
    })
    .max(100, {
      message: "Question must be max 100 characters.",
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
        return (
          <section key={e.id}>
            <hr />
            <article className=" p-3 max-w-md">
              <p>
                {e.id}. {e.content}
              </p>{" "}
              <p>[similarity:{e.similarity}]</p>
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
          className=" w-full flex justify-center gap-3 my-5"
        >
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem className=" max-w-sm w-[50%] flex-col ">
                <FormControl>
                  <Input placeholder="Ask me..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={disabled} className="max-w-sm " type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <div className="flex text-center align-middle justify-center w-full flex-col items-center  p-10">
        <p className=" text-xl p-3 max-w-md">{values.answer}</p>
        {values.sources}
      </div>
    </>
  );
}
