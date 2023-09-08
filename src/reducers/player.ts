import { Player as PlayerType } from "../types/player";
import { Card as CardType} from "../types/card";
import { getImageSrc } from "../utility/Utility";
import { v4 as uuidv4 } from "uuid";
import { getNextPlayerId } from "../utility/GameUtility";
import { INIT_CARDS_COUNT_PER_PLAYER } from "../game/Game";

type PlayerState = Readonly<{ players: ReadonlyArray<PlayerType>; currentPlayerId: string }>;

export const playersInitialState: PlayerState = {
  players: [],
  currentPlayerId: "",
};

type PlayerReducerAction =
  | {
      type: "INIT";
      data: Readonly<{
        cards: ReadonlyArray<CardType>;
      }>;
    }
  | {
      type: "DRAW";
      data: Readonly<{
        cards: ReadonlyArray<CardType>;
      }>;
    }
  | {
      type: "PLAY";
      data: Readonly<{
        selectedCard: CardType;
      }>;
    };

export const playerReducer = (
  { players, currentPlayerId }: PlayerState,
  { type, data }: PlayerReducerAction
): PlayerState => {
  switch (type) {
    case "INIT": {
      const fstPlayerId = uuidv4();
      return {
        players: [
          {
            id: fstPlayerId,
            isReal: false,
            cards: data.cards.slice(0, INIT_CARDS_COUNT_PER_PLAYER),
            position: "left",
          },
          {
            id: uuidv4(),
            isReal: false,
            cards: data.cards.slice(
              INIT_CARDS_COUNT_PER_PLAYER,
              2 * INIT_CARDS_COUNT_PER_PLAYER
            ),
            position: "top",
          },
          {
            id: uuidv4(),
            isReal: false,
            cards: data.cards.slice(
              2 * INIT_CARDS_COUNT_PER_PLAYER,
              3 * INIT_CARDS_COUNT_PER_PLAYER
            ),
            position: "right",
          },
          {
            id: uuidv4(),
            isReal: true,
            cards: data.cards.slice(
              3 * INIT_CARDS_COUNT_PER_PLAYER,
              4 * INIT_CARDS_COUNT_PER_PLAYER
            ),
            position: "bottom",
          },
        ],
        currentPlayerId: fstPlayerId,
      };
    }
    case "DRAW":
      return {
        players: players.map((p) => {
          if (p.id === currentPlayerId) {
            return { ...p, cards: [...p.cards, ...data.cards] };
          }
          return p;
        }),
        currentPlayerId: getNextPlayerId(players, currentPlayerId),
      };
    case "PLAY":
      return {
        players: players
          .map((p) => {
            if (p.id === currentPlayerId) {
              return {
                ...p,
                cards: p.cards.filter(
                  (card) =>
                    !getImageSrc(data.selectedCard).includes(getImageSrc(card))
                ),
              };
            }
            return p;
          })
          .filter((p) => p.cards.length !== 0),
        currentPlayerId: getNextPlayerId(players, currentPlayerId),
      };
    default:
      return { players, currentPlayerId };
  }
};
