import { Card, Suit } from "./card";

export type Board = Readonly<{
  stock: ReadonlyArray<Card>;
  discardPile: ReadonlyArray<Card>;
  isCardEffectOn: boolean;
  activeSuit: Suit;
  nextStockDrawCount: number;
}>;