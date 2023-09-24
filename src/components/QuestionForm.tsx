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

const formSchema = z.object({
  question: z
    .string()
    .min(2, {
      message: "Question must be at least 3 characters.",
    })
    .max(50, {
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
  function onSubmit(values: z.infer<typeof formSchema>) {
    values;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" w-full flex justify-center items-center flex-col space-y-8"
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem className=" max-w-sm w-full flex justify-center items-center flex-col mt-10">
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Ask me..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="max-w-sm" type="submit">
          Submit
        </Button>
        
      </form>
    </Form>
  );
}
