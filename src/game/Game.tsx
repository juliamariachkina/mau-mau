import { PlayBoardArea } from "./PlayBoardArea";
import { Player } from "./Player";
import { PlayState } from "./PlayState";
import { Button } from "../ui/Button";
import { MouseEventHandler, useEffect, useState, useReducer } from "react";
import { Card as CardType, deck, Suit, SUITS } from "../types/card";
import { getImageSrc } from "../utility/Utility";
import { Modal, SuitChoiceModal } from "../ui/Modal";
import { playerReducer, playersInitialState } from "../reducers/player";
import { canBePlayedOn, drawCards, getCurrentPlayer, getPlayerCards } from "../utility/GameUtility";
import { boardInitialState, boardReducer } from "../reducers/board";

const PLAYER_TURN_TIMEOUT = 1200;
export const INIT_CARDS_COUNT_PER_PLAYER = 4;

export const Game = (props: {}) => {
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
    boardDispatch({type: "SUIT_CHOICE", data: {imageSrc: target.src}});
    setRenderSuitChoiceModal(false);
  };

  const handleSkipTurnClick = () => {
    if (!getCurrentPlayer(players, currentPlayerId, beginRound).isReal) {
      return;
    }
    let newStock = board.stock;
    let newDiscardPile = board.discardPile;
    let drawnCards: CardType[] = [];
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
    playersDispatch({ type: "DRAW", data: { cards: drawnCards } });
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
