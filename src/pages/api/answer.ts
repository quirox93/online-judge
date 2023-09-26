import type { APIRoute } from "astro";
import { generateResponse } from "./controllers";
import { getUser } from "@/auth";

export const POST: APIRoute = async ({ request }) => {
  //return new Response(JSON.stringify(test));
  const user = await getUser(request);
  if (!user)
    return new Response(JSON.stringify({ error: "You must be logged." }), {
      status: 400,
    });
  if (user?.role !== "premium")
    return new Response(JSON.stringify({ error: "Paid me 🐭" }), {
      status: 400,
    });
  const { question } = await request.json();

  const response = await generateResponse(question);

  return new Response(JSON.stringify(response));
};
const test = {
  question: "se activan los efectos on deletions de los digimons de seguridad?",
  answer:
    "No, los Digimon de Seguridad no pueden activar ningún efecto a menos que sean efectos de [Seguridad].",
  sources: [
    {
      id: 145,
      content:
        "Other Rulings: \nQ: Do [On Deletion] effects activate when Security Digimon are deleted?\nA: No, Security Digimon cannot activate any effects unless they are [Security] effects. From: General Rules#Digimon Cards \n\n",
      similarity: 0.869622417114843,
    },
    {
      id: 108,
      content:
        'Main Phase: \nQ: Do effects with [On Play], [When Digivolving], [On Deletion], [When Attacking] have to resolve at the timing specified? For example, if I have an effect with [On Deletion], am I required to activate it when the Digimon is deleted? \nA: Yes, whenever possible. However, if the effect has "can" in its text, you can choose whether or not to activate it. Effects that read "you may" (or "do <X> to do <Y>") are optional, and can be chosen not to be activated.\n\n',
      similarity: 0.843916296958947,
    },
    {
      id: 144,
      content:
        "Other Rulings: \nQ: I have a Digimon with effects that activate on attack or at the end of attacks. Do these effects activate when my other Digimon attack?\nA: No, they only activate when the Digimon with those effects makes an attack.\n\n",
      similarity: 0.826491684944926,
    },
    {
      id: 169,
      content:
        "Main Phase: \nQ: I have a Digimon with effects that activate on attack or at the end of attacks. Do these effects activate when my other Digimon attack? \nA: No, they only activate when the Digimon with those effects makes an attack.\n\n",
      similarity: 0.822969598062134,
    },
    {
      id: 105,
      content:
        "Main Phase: \nQ: If I digivolve into a Digimon that has an [On Play] effect, does it activate?\nA: No. [On Play] effects don't activate with digivolution.\n\n",
      similarity: 0.819569381552451,
    },
  ],
};
