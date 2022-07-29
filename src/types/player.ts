import { Card } from "./card";

export type Position = "top" | "right" | "left" | "bottom";

export interface Player {
    id: string,
    isReal: boolean,
    cards: Card[],
    position: Position,
}