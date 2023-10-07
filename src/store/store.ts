import type { OficialData } from "@/interfaces/interfaces";
import { atom } from "nanostores";

export const allCards = atom([] as OficialData[]);

export const isLoggedIn = atom(false);
