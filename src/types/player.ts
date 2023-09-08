import { Card } from "./card";

export type Position = "top" | "right" | "left" | "bottom";

export type Player = Readonly<{
    id: string,
    isReal: boolean,
    cards: ReadonlyArray<Card>,
    position: Position,
}>