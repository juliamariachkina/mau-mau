import { getNextStockDrawCount } from "../utility/GameUtility";
import { Board } from "../types/board";
import { SUITS, Card as CardType, Suit } from "../types/card";
import { INIT_CARDS_COUNT_PER_PLAYER } from "../game/Game";

export const boardInitialState: Board = {
  stock: [],
  discardPile: [],
  isCardEffectOn: false,
  activeSuit: SUITS[0],
  nextStockDrawCount: 1,
};

type BoardReducerAction =
  | {
      type: "INIT";
      data: Readonly<{
        stock: ReadonlyArray<CardType>;
      }>;
    }
  | {
      type: "SKIP_TURN";
      data: Readonly<{
        stock: ReadonlyArray<CardType>;
        discardPile: ReadonlyArray<CardType>;
      }>;
    }
  | {
      type: "DRAW";
      data: Readonly<{
        stock: ReadonlyArray<CardType>;
        discardPile: ReadonlyArray<CardType>;
      }>;
    }
  | {
      type: "PLAY";
      data: Readonly<{
        selectedCard: CardType;
        newSuit?: Suit;
      }>;
    }
  | { type: "SUIT_CHOICE"; data: Readonly<{ imageSrc: string }> };

export const boardReducer = (
  state: Board,
  { type, data }: BoardReducerAction
): Board => {
  switch (type) {
    case "INIT": {
      const shuffledStock = data.stock;
      const discardPileTop = shuffledStock.at(-1)!;
      return {
        stock: shuffledStock.slice(0, -1 - INIT_CARDS_COUNT_PER_PLAYER * 4),
        discardPile: [discardPileTop],
        isCardEffectOn:
          discardPileTop.rank === "A" || discardPileTop.rank === "7",
        activeSuit: discardPileTop.suit,
        nextStockDrawCount: getNextStockDrawCount(
          discardPileTop.rank === "A" || discardPileTop.rank === "7",
          discardPileTop,
          1
        ),
      };
    }
    case "SKIP_TURN":
      return {
        ...state,
        stock: data.stock,
        discardPile: data.discardPile,
        isCardEffectOn: false,
        nextStockDrawCount: 1,
      };

    case "DRAW":
      return {
        ...state,
        stock: data.stock,
        discardPile: data.discardPile,
        isCardEffectOn: false,
        nextStockDrawCount: 1,
      };
    case "PLAY":
      return {
        ...state,
        discardPile: [...state.discardPile, data.selectedCard],
        isCardEffectOn:
          data.selectedCard.rank === "7" || data.selectedCard.rank === "A",
        activeSuit: data.newSuit || data.selectedCard.suit,
        nextStockDrawCount: getNextStockDrawCount(
          data.selectedCard.rank === "7" || data.selectedCard.rank === "A",
          data.selectedCard,
          state.nextStockDrawCount
        ),
      };
    case "SUIT_CHOICE":
      return {...state, activeSuit: getSuit(data.imageSrc)};
    default:
      return state;
  }
};

const getSuit = (imageSrc: string) => {
  if (imageSrc.includes("club")) {
    return "club";
  }
  if (imageSrc.includes("diamond")) {
    return "diamond";
  }
  if (imageSrc.includes("spade")) {
    return "spade";
  }
  if (imageSrc.includes("heart")) {
    return "heart";
  }
  throw Error("Incorrect image");
};
