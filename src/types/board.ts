import { Card, Suit } from "./card";

export type Board = {
  stock: Card[];
  discardPile: Card[];
  isCardEffectOn: boolean;
  activeSuit: Suit;
  nextStockDrawCount: number;
};