import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
  question: z
    .string()
    .min(2, {
      message: "Question must be at least 3 characters.",
    })
    .max(70, {
      message: "Question must be max 50 characters.",
    }),
});
export default function QuestionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });
  interface Value {
    question: string;
    answer: string;
    sources: string;
  }

  const [values, setValues] = useState<Value>({
    question: "",
    answer: "",
    sources: "",
  });
  interface Source {
    id: string;
    content: string;
    similarity: string;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setValues({ ...values, answer: "Cargando..." });
    const response = await fetch("/api/answer", {
      method: "POST",
      body: JSON.stringify(values),
    });
    const { answer, sources } = await response.json();

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
  }
  let disabled = false;
  if (values.answer === "Cargando...") disabled = true;
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" w-full flex justify-center gap-3 m-5"
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
