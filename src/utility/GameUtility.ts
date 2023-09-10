import { Card as CardType, Suit } from "../types/card";
import { Player as PlayerType, Position } from "../types/player";

export const drawCards = (
  stock: ReadonlyArray<CardType>,
  discardPile: ReadonlyArray<CardType>,
  drawCount: number
) => {
  if (drawCount <= 0) return [stock, discardPile, []];
  if (stock.length > drawCount) {
    return [stock.slice(0, -drawCount), discardPile, stock.slice(-drawCount)];
  }
  if (stock.length === drawCount) {
    return [
      discardPile.slice(0, -1).reverse(),
      discardPile.slice(-1),
      stock.slice(-drawCount),
    ];
  }
  const newStock = discardPile.slice(0, -1).reverse();
  const newDiscardPile = discardPile.slice(-1);
  const drawnCards = [
    ...stock.slice(),
    ...newStock.slice(-(drawCount - stock.length)),
  ];
  const stockAfterDrawing = newStock.slice(0, -(drawCount - stock.length));
  return [stockAfterDrawing, newDiscardPile, drawnCards];
}

export const canBePlayedOn = (
  card: CardType,
  discardPile: ReadonlyArray<CardType>,
  activeSuit: Suit,
  isCardEffectOn: boolean
) => {
  if (!isCardEffectOn) {
    return (
      card.suit === activeSuit ||
      card.rank === discardPile.at(-1)?.rank ||
      card.rank === "J"
    );
  }
  if (discardPile.at(-1)?.rank === "A") {
    return card.rank === "A";
  }
  if (discardPile.at(-1)?.rank === "7") {
    return card.rank === "7";
  }
  return false;
}

export const getNextStockDrawCount = (
  isCardEffectOn: boolean,
  discardPileTop: CardType,
  nextStockDrawCount: number
) => {
  if (!isCardEffectOn) {
    return 1;
  }
  if (discardPileTop.rank === "A") {
    return 0;
  }
  if (discardPileTop.rank === "7") {
    return nextStockDrawCount + (nextStockDrawCount % 2 === 0 ? 2 : 1);
  }
  return 1;
}

export const getCurrentPlayer = (
  players: ReadonlyArray<PlayerType>,
  currentPlayerId: string,
  beginRound: boolean
): PlayerType => {
  const player = players.find((p) => p.id === currentPlayerId);
  if (player === undefined) {
    if (!beginRound) {
      throw Error("Player with current player id isn't found");
    }
    return { id: "", isReal: false, cards: [], position: "left" };
  }
  return player;
}

export const getNextPlayerId = (
  players: ReadonlyArray<PlayerType>,
  currentPlayerId: string
) => {
  const index = players.findIndex((p) => p.id === currentPlayerId);
  return players[(index + 1) % players.length].id;
};

export const getPlayerCards = (
  players: ReadonlyArray<PlayerType>,
  position: Position
) => {
  return players.find((p) => p.position === position)?.cards ?? [];
};
