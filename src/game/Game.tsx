import { PlayBoardArea } from "./PlayBoardArea";
import { Player } from "./Player";
import { PlayState } from "./PlayState";
import { Button } from "../ui/Button";
import { MouseEventHandler, useEffect, useState, useReducer } from "react";
import { Card as CardType, deck, Suit, SUITS } from "../types/card";
import { Player as PlayerType, Position } from "../types/player";
import { getImageSrc } from "../utility/Utility";
import { v4 as uuidv4 } from "uuid";
import { Modal, SuitChoiceModal } from "../ui/Modal";
import { Board } from "../types/board";

const PLAYER_TURN_TIMEOUT = 1200;
const INIT_CARDS_COUNT_PER_PLAYER = 4;

const boardInitialState: Board = {
  stock: [],
  discardPile: [],
  isCardEffectOn: false,
  activeSuit: SUITS[0],
  nextStockDrawCount: 1,
};

type BoardReducerAction =
  | {
      type: "INIT";
      data: {
        stock: CardType[];
      };
    }
  | {
      type: "SKIP_TURN";
      data: {
        stock: CardType[];
        discardPile: CardType[];
      };
    }
  | {
      type: "DRAW";
      data: {
        stock: CardType[];
        discardPile: CardType[];
      };
    }
  | {
      type: "PLAY";
      data: {
        selectedCard: CardType;
        newSuit?: Suit;
      };
    };

const boardReducer = (
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
    default:
      return state;
  }
};

type PlayerState = { players: PlayerType[]; currentPlayerId: string };

const playersInitialState: PlayerState = {
  players: [],
  currentPlayerId: "",
};

type PlayerReducerAction =
  | {
      type: "INIT";
      data: {
        cards: CardType[];
      };
    }
  | {
      type: "DRAW";
      data: {
        cards: CardType[];
      };
    }
  | {
      type: "PLAY";
      data: {
        selectedCard: CardType;
      };
    };

const playerReducer = (
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

export const Game = (props: {}) => {
  //   const [players, setPlayers] = useState<PlayerType[]>([]);
  //   const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [activeSuit, setActiveSuit] = useState(SUITS[0]);
  const [beginRound, setBeginRound] = useState(true);
  const [renderFinishModal, setRenderFinishModal] = useState(false);
  const [renderSuitChoiceModal, setRenderSuitChoiceModal] = useState(false);

  const [board, boardDispatch] = useReducer(boardReducer, boardInitialState);
  const [{ players, currentPlayerId }, playersDispatch] = useReducer(
    playerReducer,
    playersInitialState
  );

  useEffect(() => {
    if (!beginRound) {
      return;
    }
    const shuffledStock = deck
      .map((card) => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
    boardDispatch({ type: "INIT", data: { stock: shuffledStock } });

    const playersCards = shuffledStock.slice(
      -INIT_CARDS_COUNT_PER_PLAYER * 4 - 1,
      -1
    );
    playersDispatch({ type: "INIT", data: { cards: playersCards } });

    setBeginRound(false);
    setRenderFinishModal(false);
    setRenderSuitChoiceModal(false);
  });

  useEffect(() => {
    if (
      currentPlayerId !== "" &&
      !getCurrentPlayer(players, currentPlayerId, beginRound).isReal &&
      !renderFinishModal &&
      !renderSuitChoiceModal
    ) {
      setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT);
    }
  }, [currentPlayerId, renderFinishModal, renderSuitChoiceModal]);

  const handleCardClick: MouseEventHandler<HTMLImageElement> = (e) => {
    makeTurnRealPlayer(e.target);
  };

  const handleModalClose = () => {
    setBeginRound(true);
  };

  const handleSuitChoice = (target: HTMLImageElement) => {
    if (target.src.includes("club")) {
      setActiveSuit("club");
    }
    if (target.src.includes("diamond")) {
      setActiveSuit("diamond");
    }
    if (target.src.includes("spade")) {
      setActiveSuit("spade");
    }
    if (target.src.includes("heart")) {
      setActiveSuit("heart");
    }
    setRenderSuitChoiceModal(false);
  };

  const handleSkipTurnClick = () => {
    if (!getCurrentPlayer(players, currentPlayerId, beginRound).isReal) {
      return;
    }
    let newStock = board.stock;
    let newDiscardPile = board.discardPile;
    let drawnCards : CardType[] = [];
    if (board.nextStockDrawCount !== 0) {
      const [stock, discardPile, cards] = drawCards(
        board.stock,
        board.discardPile,
        board.nextStockDrawCount
      );
      newStock = stock;
      newDiscardPile = discardPile;
      drawnCards = cards;
    }
    playersDispatch({type: "DRAW", data: {cards: drawnCards}})
    boardDispatch({
      type: "SKIP_TURN",
      data: { stock: newStock, discardPile: newDiscardPile },
    });
  };

  function drawFromStockRealPlayer() {
    const [stock, discardPile, drawnCards] = drawCards(
      board.stock,
      board.discardPile,
      board.nextStockDrawCount
    );
    playersDispatch({ type: "DRAW", data: { cards: drawnCards } });
    boardDispatch({
      type: "DRAW",
      data: { stock, discardPile },
    });
  }

  function tryPlayRealPlayerCard(selectedCard: CardType) {
    if (
      !canBePlayedOn(
        selectedCard,
        board.discardPile,
        board.activeSuit,
        board.isCardEffectOn
      )
    ) {
      return false;
    }
    playersDispatch({ type: "PLAY", data: { selectedCard } });

    boardDispatch({ type: "PLAY", data: { selectedCard } });
    setRenderFinishModal(
      getCurrentPlayer(players, currentPlayerId, beginRound).cards.length === 1
    );
    setRenderSuitChoiceModal(selectedCard.rank === "Q");
    return true;
  }

  function makeTurnRealPlayer(target: EventTarget) {
    if (!getCurrentPlayer(players, currentPlayerId, beginRound).isReal) {
      return;
    }
    if (target === document.querySelector(".stock")) {
      drawFromStockRealPlayer();
      return;
    }
    const clickedOnCard = getCurrentPlayer(
      players,
      currentPlayerId,
      beginRound
    ).cards.find((card) =>
      (target as HTMLImageElement)
        .getAttribute("src")
        ?.includes(getImageSrc(card))
    );
    if (clickedOnCard === undefined) {
      throw Error(
        "User didn't click on stock or any of his cards, but the card click event handler " +
          "was invoked. Maybe player cards are in invalid state"
      );
    }
    tryPlayRealPlayerCard(clickedOnCard);
  }

  function makeTurnArtificialPlayer() {
    const result = tryPlayCardArtificialPlayer();
    if (result) {
      return;
    }
    const [stock, discardPile, drawnCards] = drawCards(
      board.stock,
      board.discardPile,
      board.nextStockDrawCount
    );

    playersDispatch({ type: "DRAW", data: { cards: drawnCards } });
    boardDispatch({ type: "DRAW", data: { stock, discardPile } });
  }

  function tryPlayCardArtificialPlayer() {
    const foundCard = getCurrentPlayer(
      players,
      currentPlayerId,
      beginRound
    ).cards.find((card) =>
      canBePlayedOn(
        card,
        board.discardPile,
        board.activeSuit,
        board.isCardEffectOn
      )
    );
    if (foundCard === undefined) {
      return false;
    }
    playersDispatch({ type: "PLAY", data: { selectedCard: foundCard } });
    const newSuit =
      foundCard.rank === "Q"
        ? SUITS[Math.floor(Math.random() * 100) % 4]
        : foundCard.suit;
    boardDispatch({ type: "PLAY", data: { selectedCard: foundCard, newSuit } });
    setRenderFinishModal(
      players.length === 2 &&
        getCurrentPlayer(players, currentPlayerId, beginRound).cards.length ===
          1
    );
    return true;
  }

  const [topPlayerCards, leftPlayerCards, rightPlayerCards, bottomPlayerCards] =
    (["top", "left", "right", "bottom"] as const).map((position) =>
      getPlayerCards(players, position)
    );

  let modalContentClass = "modal__content modal__content--finish";
  let closeBtnClass = "close-btn close-btn--finish";
  let text = "You finished";
  if (
    players.length === 3 &&
    !players.find((p) => p.isReal) &&
    renderFinishModal
  ) {
    modalContentClass = "modal__content modal__content--win";
    closeBtnClass = "close-btn close-btn--win";
    text = "You won!";
  }
  if (players.length === 1 && players[0].isReal && renderFinishModal) {
    modalContentClass = "modal__content modal__content--loss";
    closeBtnClass = "close-btn close-btn--loss";
    text = "It does not matter how slowly you go, as long as you don’t stop";
  }

  return (
    <>
      <PlayBoardArea position="top">
        <Player
          isReal={false}
          position="top"
          cards={topPlayerCards}
          onCardClick={() => {}}
        />
      </PlayBoardArea>
      <PlayBoardArea position="center">
        <Player
          isReal={false}
          position="left"
          cards={leftPlayerCards}
          onCardClick={() => {}}
        />
        <PlayState
          discardPileTopSrc={getImageSrc(board.discardPile.at(-1))}
          onStockClick={handleCardClick}
          activeSuit={board.activeSuit}
          activePlayer={getCurrentPlayer(players, currentPlayerId, beginRound)}
          nextDrawCount={board.nextStockDrawCount}
        />
        <Player
          isReal={false}
          position="right"
          cards={rightPlayerCards}
          onCardClick={() => {}}
        />
      </PlayBoardArea>
      <PlayBoardArea position="bottom">
        <Button text="Skip turn" onClick={handleSkipTurnClick} />
        <Player
          isReal
          position=""
          cards={bottomPlayerCards}
          onCardClick={handleCardClick}
        />
      </PlayBoardArea>
      {renderFinishModal && (
        <Modal
          modalContentClass={modalContentClass}
          closeBtnClass={closeBtnClass}
          text={text}
          onClick={handleModalClose}
        />
      )}
      {renderSuitChoiceModal && (
        <SuitChoiceModal onSuitImageClick={handleSuitChoice} />
      )}
    </>
  );
};

function drawCards(
  stock: CardType[],
  discardPile: CardType[],
  drawCount: number
) {
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

function canBePlayedOn(
  card: CardType,
  discardPile: CardType[],
  activeSuit: Suit,
  isCardEffectOn: boolean
) {
  if (!isCardEffectOn) {
    return (
      card.suit === activeSuit ||
      card.rank === discardPile.at(-1)?.rank ||
      card.rank === "Q"
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

function getNextStockDrawCount(
  isCardEffectOn: boolean,
  discardPileTop: CardType,
  nextStockDrawCount: number
) {
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

function getCurrentPlayer(
  players: PlayerType[],
  currentPlayerId: string,
  beginRound: boolean
): PlayerType {
  const player = players.find((p) => p.id === currentPlayerId);
  if (player === undefined) {
    if (!beginRound) {
      throw Error("Player with current player id isn't found");
    }
    return { id: "", isReal: false, cards: [], position: "left" };
  }
  return player;
}

function getNextPlayerId(players: PlayerType[], currentPlayerId: string) {
  const index = players.findIndex((p) => p.id === currentPlayerId);
  return players[(index + 1) % players.length].id;
}

function getPlayerCards(players: PlayerType[], position: Position) {
  return players.find((p) => p.position === position)?.cards ?? [];
}
