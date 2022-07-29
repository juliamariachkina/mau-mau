import cardBack from "../images/card-back.png";

import { PlayBoardArea } from "./PlayBoardArea";
import { Player } from "./Player";
import { PlayState } from "./PlayState";
import { Button } from "./Button";
import { MouseEventHandler, useEffect, useState } from "react";
import { Card as CardType, deck, Suit, Rank, SUITS } from "./types/card";
import { Player as PlayerType, Position } from "./types/player";
import { getImageSrc } from "./Utility";
import { v4 as uuidv4 } from 'uuid';

const PLAYER_TURN_TIMEOUT = 1200;
const INIT_CARDS_COUNT_PER_PLAYER = 1;

export function App(props: {}) {
    const [stock, setStock] = useState<CardType[]>([]);
    const [discardPile, setDiscardPile] = useState<CardType[]>([]);
    const [players, setPlayers] = useState<PlayerType[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState("");
    const [isCardEffectOn, setCardEffect] = useState(false);
    const [activeSuit, setActiveSuit] = useState(SUITS[0]);
    const [nextStockDrawCount, setNextStockDrawCount] = useState(1);
    const [beginRound, setBeginRound] = useState(true);

    useEffect(() => {
        if (!beginRound) {
            return;
        }
        const shuffledStock = deck
            .map(card => ({ card, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ card }) => card);
        const discardPileTop = shuffledStock.at(-1);
        if (discardPileTop === undefined) {
            throw Error("Stock is empty! DECK is probably incorrectly initialised");
        }
        setDiscardPile([discardPileTop]);

        const playersCards = shuffledStock.slice(-INIT_CARDS_COUNT_PER_PLAYER * 4 - 1, -1);
        const fstPlayerId = uuidv4();
        setPlayers([
            { id: fstPlayerId, isReal: false, cards: playersCards.slice(0, INIT_CARDS_COUNT_PER_PLAYER), position: "left" },
            { id: uuidv4(), isReal: false, cards: playersCards.slice(INIT_CARDS_COUNT_PER_PLAYER, 2 * INIT_CARDS_COUNT_PER_PLAYER), position: "top" },
            { id: uuidv4(), isReal: false, cards: playersCards.slice(2 * INIT_CARDS_COUNT_PER_PLAYER, 3 * INIT_CARDS_COUNT_PER_PLAYER), position: "right" },
            { id: uuidv4(), isReal: true, cards: playersCards.slice(3 * INIT_CARDS_COUNT_PER_PLAYER, 4 * INIT_CARDS_COUNT_PER_PLAYER), position: "bottom" },
        ]);

        setStock(shuffledStock.slice(0, -1 - INIT_CARDS_COUNT_PER_PLAYER * 4));
        setCurrentPlayerId(fstPlayerId);
        setCardEffect(discardPileTop.rank === "A" || discardPileTop.rank === "7");
        setActiveSuit(discardPileTop.suit);
        getNextStockDrawCount(discardPileTop.rank === "A" || discardPileTop.rank === "7", discardPileTop, 1);
        setBeginRound(false);
    });

    function getCurrentPlayer(): PlayerType {
        const player = players.find(p => p.id === currentPlayerId);
        if (player === undefined) {
            if (!beginRound) {
                throw Error("Player with current player id isn't found");
            }
            return { id: "", isReal: false, cards: [], position: "left" };
        }
        return player;
    }

    function getNextPlayerId() {
        const index = players.findIndex(p => p.id === currentPlayerId);
        return players[(index + 1) % players.length].id;
    }

    useEffect(() => {
        if (currentPlayerId !== "" && !getCurrentPlayer().isReal) {
            setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT);
        }
    }, [currentPlayerId]);

    const handleCardClick: MouseEventHandler<HTMLImageElement> = (e) => {
        makeTurnRealPlayer(e.target);
    }

    const handleSkipTurnClick = () => {
        if (!getCurrentPlayer().isReal) {
            return;
        }
        if (nextStockDrawCount === 0) {
            setCurrentPlayerId(getNextPlayerId());
            setCardEffect(false);
            setNextStockDrawCount(1);
        } else {
            const [stockAfterDrawing, discardPileAfterDrawing, drawnCards] = drawCards(stock, discardPile, nextStockDrawCount);
            setStock(stockAfterDrawing);
            setDiscardPile(discardPileAfterDrawing);
            setPlayers(players.map(p => {
                if (p.id === currentPlayerId) {
                    p.cards = [...p.cards, ...drawnCards];
                }
                return p;
            }));
            setCurrentPlayerId(getNextPlayerId());
            setCardEffect(false);
            setNextStockDrawCount(1);
        }
    }

    function drawFromStockRealPlayer() {
        const [stockAfterDrawing, discardPileAfterDrawing, drawnCards] = drawCards(stock, discardPile, nextStockDrawCount);
        setStock(stockAfterDrawing);
        setDiscardPile(discardPileAfterDrawing);
        setPlayers(players.map(p => {
            if (p.id === currentPlayerId) {
                return { ...p, cards: [...p.cards, ...drawnCards] };
            }
            return p;
        }));
        setCurrentPlayerId(getNextPlayerId());
        setCardEffect(false);
        setNextStockDrawCount(1);
    }

    function tryPlayRealPlayerCard(clickedOnCard: CardType) {
        if (!canBePlayedOn(clickedOnCard, discardPile, activeSuit, isCardEffectOn)) {
            return false;
        }
        if (getCurrentPlayer().cards.length === 1) {
            //Game over: success
            setBeginRound(true);
            return true;
        }
        setDiscardPile([...discardPile, clickedOnCard]);
        setPlayers(players.map(p => {
            if (p.id === currentPlayerId) {
                return { ...p, cards: p.cards.filter(card => !getImageSrc(clickedOnCard).includes(getImageSrc(card))) };
            }
            return p;
        }));
        setCurrentPlayerId(getNextPlayerId());
        setCardEffect(clickedOnCard.rank === "7" || clickedOnCard.rank === "A");
        setActiveSuit(clickedOnCard.suit);
        setNextStockDrawCount(getNextStockDrawCount(clickedOnCard.rank === "7" || clickedOnCard.rank === "A", clickedOnCard, nextStockDrawCount));
        return true;
    }

    function makeTurnRealPlayer(target: EventTarget) {
        if (!getCurrentPlayer().isReal) {
            return;
        }
        if (target === document.querySelector(".stock")) {
            drawFromStockRealPlayer();
            return;
        }
        const clickedOnCard = getCurrentPlayer().cards
            .find(card => (target as HTMLImageElement).getAttribute("src")?.includes(getImageSrc(card)));
        if (clickedOnCard === undefined) {
            throw Error("User didn't click on stock or any of his cards, but the card click event handler " +
                "was invoked. Maybe player cards are in invalid state");
        }
        tryPlayRealPlayerCard(clickedOnCard);
    }

    function makeTurnArtificialPlayer() {
        if (!tryPlayCardArtificialPlayer()) {
            const [stockAfterDrawing, discardPileAfterDrawing, drawnCards] = drawCards(stock, discardPile, nextStockDrawCount);
            setStock(stockAfterDrawing);
            setDiscardPile(discardPileAfterDrawing);
            setPlayers(players.map(p => {
                if (p.id === currentPlayerId) {
                    return { ...p, cards: [...p.cards, ...drawnCards] };
                }
                return p;
            }));
            setCurrentPlayerId(getNextPlayerId());
            setCardEffect(false);
            setNextStockDrawCount(1);
        }
    }

    function tryPlayCardArtificialPlayer() {
        const foundCard = getCurrentPlayer().cards
            .find(card => canBePlayedOn(card, discardPile, activeSuit, isCardEffectOn));
        if (foundCard === undefined) {
            return false;
        }
        const willPlayerBeRemoved = getCurrentPlayer().cards.length === 1;
        if (players.length === 2 && willPlayerBeRemoved) {
            //Game over: failure
            setBeginRound(true);
            return true;
        }
        setDiscardPile([...discardPile, foundCard]);
        const playersAfterPlayedCardRemoval = players.map(p => {
            if (p.id === currentPlayerId) {
                return { ...p, cards: p.cards.filter(c => !getImageSrc(foundCard).includes(getImageSrc(c))) };
            }
            return p;
        });
        const playersAfterPossibleCurrentPlayerRemoval = willPlayerBeRemoved
            ? playersAfterPlayedCardRemoval.filter(p => currentPlayerId !== p.id)
            : playersAfterPlayedCardRemoval;
        setCurrentPlayerId(getNextPlayerId());
        setPlayers(playersAfterPossibleCurrentPlayerRemoval);
        setCardEffect(foundCard.rank === "7" || foundCard.rank === "A");
        const newSuit = foundCard.rank === "J"
            ? SUITS[Math.floor(Math.random() * 100) % 4]
            : foundCard.suit;
        setActiveSuit(newSuit);
        setNextStockDrawCount(getNextStockDrawCount(foundCard.rank === "7" || foundCard.rank === "A", foundCard, nextStockDrawCount));
        return true;
    }

    const [topPlayerCards, leftPlayerCards, rightPlayerCards, bottomPlayerCards] =
        (["top", "left", "right", "bottom"] as const).map(getPlayerCards);

    function getPlayerCards(position: Position) {
        return players.find(p => p.position === position)?.cards ?? [];
    }

    return (
        <>
            <PlayBoardArea position="top">
                <Player isReal={false} position="top" cards={topPlayerCards} onCardClick={() => { }} />
            </PlayBoardArea>
            <PlayBoardArea position="center">
                <Player isReal={false} position="left" cards={leftPlayerCards} onCardClick={() => { }} />
                <PlayState discardPileTopSrc={getImageSrc(discardPile.at(-1))}
                    onStockClick={handleCardClick}
                    activeSuit={activeSuit}
                    activePlayer={getCurrentPlayer()}
                    nextDrawCount={nextStockDrawCount} />
                <Player isReal={false} position="right" cards={rightPlayerCards} onCardClick={() => { }} />
            </PlayBoardArea>
            <PlayBoardArea position="bottom">
                <Button text="Skip turn" onClick={handleSkipTurnClick} />
                <Player isReal position="" cards={bottomPlayerCards} onCardClick={handleCardClick} />
            </PlayBoardArea>
        </>
    );
}

function drawCards(stock: CardType[], discardPile: CardType[], drawCount: number) {
    if (drawCount <= 0)
        return [stock, discardPile, []];
    if (stock.length > drawCount) {
        return [stock.slice(0, -drawCount), discardPile, stock.slice(-drawCount)];
    }
    if (stock.length === drawCount) {
        return [discardPile.slice(0, -1).reverse(), discardPile.slice(-1), stock.slice(-drawCount)];
    }
    const newStock = discardPile.slice(0, -1).reverse();
    const newDiscardPile = discardPile.slice(-1);
    const drawnCards = [...stock.slice(), ...newStock.slice(-(drawCount - stock.length))];
    return [newStock, newDiscardPile, drawnCards];
}

function canBePlayedOn(card: CardType, discardPile: CardType[], activeSuit: Suit, isCardEffectOn: boolean) {
    if (!isCardEffectOn) {
        return card.suit === activeSuit
            || card.rank === discardPile.at(-1)?.rank
            || card.rank === "J";
    }
    if (discardPile.at(-1)?.rank === "A") {
        return card.rank === "A";
    }
    if (discardPile.at(-1)?.rank === "7") {
        return card.rank === "7";
    }
    return false;
}

function getNextStockDrawCount(isCardEffectOn: boolean, discardPileTop: CardType, nextStockDrawCount: number) {
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