import type { APIRoute } from "astro";
import { generateResponse } from "../../utils/controllers";
import { getUser } from "@/utils/supabaseServer";
import { accessTokenName, refreshTokenName } from "@/utils/config";
import { parseCookies } from "../../utils/utils";
export const POST: APIRoute = async ({ request }) => {
  try {
    const { question, cardRef } = await request.json();
    const cookies = parseCookies(request?.headers?.get("cookie"));

    if (!cookies)
      return new Response(JSON.stringify({ error: "You must be logged." }), {
        status: 400,
      });
    const accessToken = cookies[accessTokenName];
    const refreshToken = cookies[refreshTokenName];
    const user = await getUser({ accessToken, refreshToken });
    if (!user)
      return new Response(JSON.stringify({ error: "You must be logged." }), {
        status: 400,
      });

    //return new Response(JSON.stringify(test));

    const response = await generateResponse(question, cardRef, user?.role);
    return new Response(JSON.stringify(response));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
const test = {
  question:
    "Como funcionaria este efecto:\n<Armor Purge> (When this Digimon would be deleted, you may trash the top card of this Digimon to prevent that deletion.)",
  answer:
    "ESTO ES UN PLACEHOLDER DE PRUEBA: De acuerdo con la Regla 4 y la Regla 3, el efecto <Armor Purge> (When this Digimon would be deleted, you may trash the top card of this Digimon to prevent that deletion.) se activaría inmediatamente antes de que el Digimon esté a punto de ser eliminado, pero antes de que realmente suceda. \n\nEste efecto interrumpe la acción que sirve como su condición de activación, en este caso, la eliminación del Digimon. Entonces, puedes elegir descartar la carta superior de este Digimon para prevenir esa eliminación. \n\nSi este efecto se ha activado una vez durante un conjunto de efectos derivados de la activación de un solo efecto, no se activará de nuevo durante la activación de cualquier efecto derivado siguiente, incluso si se cumple la condición de activación. Solo puede ser activado de nuevo una vez que todos los efectos derivados hayan sido activados.",
  sources: [
    {
      id: 4,
      content:
        "Some effect text refers to “when <something> would” happen. A “when <something> would” effect only activates once during a set of effects derived from a single effect’s activation, even if it is not a [Once Per Turn] effect. If a “when <something> would” effect has already been activated, it won’t trigger or activate during the activation of any following derived effects, even if the trigger condition is met.\n" +
        "(Example: When both players have Digimon with a “When this Digimon would be deleted, by deleting 1 of your opponents Digimon, prevent this Digimons deletion” effect, if your Digimon is affected by a deletion effect, “When this Digimon would be deleted” is triggered and activated for your Digimon, then a deletion of your opponents Digimon is attempted. This is interrupted by the triggering and activation of “When this Digimon would be deleted” from your opponents Digimon, and a deletion of your Digimon is again attempted. The When this Digimon would be deleted” effect has already activated for your Digimon, therefore it is not triggered again, and your Digimon is deleted.)\n Once all derived effects have activated, a “when <something> would” effect canbe triggered again.keywords: null",
      sources: [Array],
      category: "General rules",
      title: "“When <something> would” in Card Text",
    },
    {
      id: 3,
      content:
        "Some effect text refers to “when” something happens to determine effect triggers, while others refer to “when <something> would” happen. These conditionals are similar, but not identical.\n" +
        "“When” effects trigger after the condition is actually met.\n" +
        "(Example: “When one of your Digimon is deleted” triggers when one of your Digimon is deleted.)\n" +
        "“When <something> would” effects trigger immediately before the condition is met.\n" +
        "(Example: “When one of your Digimon would be deleted” triggers when one of your Digimon is about to be deleted, but before it actually happens.) “When <something> would” effects interrupt the actions that serves as their trigger conditions. This can sometimes result in the action that meets the trigger condition being cancelled.\n" +
        "(Example: “When one of your Digimon would be deleted, return that Digimon to its owner’s hand” returns one of your Digimon to its owner’s hand before it can be deleted.)",
      keywords: null,
      sources: [Array],
      category: "General rules",
      title: "“When” and “Would” in Card Text",
    },
  ],
};
