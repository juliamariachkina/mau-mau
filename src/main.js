"use strict";
const DOT = ".";
const DISCARD_PILE = "discard-pile";
const STOCK = "stock";
const MODAL = "modal";
const MODAL_CONTENT = "modal__content";
const CLOSE_BTN = "close-btn";
const SRC = "src";
const BUTTON = "button";
const CLICK = "click";
const LI = "li";
const ACTIVE_SUIT = "active-suit";
const ACTIVE_PLAYER = "active-player";
const IMG = "img";
const NEXT_DRAW_AMOUNT = "next-draw-amount";
const USER_GUIDE = "user-guide";
let abortController = new AbortController();
const FACE_DOWN_CARD_SRC = "images/card-back.png";
const FACE_DOWN_ROTATED_CARD_SRC = "images/card-back-rotated.png";
const PLAYER_TURN_TIMEOUT = 1200;
const SUITS = ["spade", "diamond", "club", "heart"];
const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const ACE = "A";
const SEVEN = "7";
const JACK = "J";
const DECK = [];
for (const suit of SUITS) {
    for (const rank of RANKS) {
        DECK.push(createCard(suit, rank));
    }
}
function createCard(suit, rank) {
    return {
        suit,
        rank,
        src: `images/${suit}${rank}.png`
    };
}
function createPlayer(isReal, cards, selector) {
    return {
        isReal,
        cards,
        selector
    };
}
function takeFourCards(stock) {
    const fourCards = stock.slice(-4);
    for (let i = 0; i < 4; ++i) {
        stock.pop();
    }
    return fourCards;
}
function canBePlayedOn(card, playState) {
    if (!playState.isCardEffectOn) {
        return card.suit === playState.activeSuit
            || card.rank === playState.discardPile.at(-1)?.rank
            || card.rank === JACK;
    }
    if (playState.discardPile.at(-1)?.rank === ACE) {
        return card.rank === ACE;
    }
    if (playState.discardPile.at(-1)?.rank === SEVEN) {
        return card.rank === SEVEN;
    }
    return false;
}
function updateNextStockDrawAmount(playState) {
    if (!playState.isCardEffectOn) {
        playState.nextStockDrawAmount = 1;
        return;
    }
    if (playState.discardPile.at(-1)?.rank === ACE) {
        playState.nextStockDrawAmount = 0;
        return;
    }
    if (playState.discardPile.at(-1)?.rank === SEVEN) {
        playState.nextStockDrawAmount += playState.nextStockDrawAmount % 2 === 0 ? 2 : 1;
    }
}
function makeTurnArtificialPlayer(playState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    if (!tryPlayCardArtificialPlayer(playState)) {
        let stockDrawAmount = playState.nextStockDrawAmount;
        while (stockDrawAmount > 0) {
            refillStockIfNessesary(playState);
            const drawnCard = playState.stock.pop();
            if (drawnCard !== undefined) {
                activePlayer.cards.push(drawnCard);
                renderCard(activePlayer, drawnCard, playState);
                stockDrawAmount--;
            }
        }
        playState.isCardEffectOn = false;
    }
    prepareForNextPlayerTurn(playState);
}
function tryPlayCardArtificialPlayer(playState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    const card = activePlayer.cards.find(c => canBePlayedOn(c, playState));
    if (card === undefined) {
        return false;
    }
    playState.activeSuit = card.suit;
    if (card.rank === JACK) {
        playState.activeSuit = SUITS[Math.floor(Math.random() * 10) % 4];
    }
    if ((card.rank === SEVEN || card.rank === ACE) && !playState.isCardEffectOn) {
        playState.isCardEffectOn = true;
    }
    playState.discardPile.push(card);
    activePlayer.cards.splice(activePlayer.cards.findIndex((c) => card.src.includes(c.src)), 1);
    renderNewCardOnDiscardPile(playState);
    const playerCardElements = document.querySelectorAll(`${activePlayer.selector} .card`);
    playerCardElements[playerCardElements.length - 1].remove();
    return true;
}
function processClickOnRealPlayerCard(clickedOnCard, targetCardElement, playState) {
    if (!canBePlayedOn(clickedOnCard, playState)) {
        return;
    }
    const activePlayer = playState.players[playState.currentPlayerIndex];
    playState.activeSuit = clickedOnCard.suit;
    if ((clickedOnCard.rank === SEVEN || clickedOnCard.rank === ACE) && !playState.isCardEffectOn) {
        playState.isCardEffectOn = true;
    }
    playState.discardPile.push(clickedOnCard);
    activePlayer.cards.splice(activePlayer.cards.findIndex((card) => clickedOnCard.src.includes(card.src)), 1);
    if (isHtmlDivElement(targetCardElement)) {
        targetCardElement.remove();
    }
    renderNewCardOnDiscardPile(playState);
    if (clickedOnCard.rank === JACK) {
        renderSuitChoiceModal(playState);
        return;
    }
    prepareForNextPlayerTurn(playState);
}
function processClickOnStock(playState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    let stockDrawAmount = playState.nextStockDrawAmount;
    while (stockDrawAmount > 0) {
        refillStockIfNessesary(playState);
        const drawnCard = playState.stock.pop();
        if (drawnCard !== undefined) {
            activePlayer.cards.push(drawnCard);
            renderCard(activePlayer, drawnCard, playState);
            stockDrawAmount--;
        }
    }
    playState.isCardEffectOn = false;
    prepareForNextPlayerTurn(playState);
}
function makeTurnRealPlayer(targetCardElement, playState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    if (!activePlayer.isReal) {
        return;
    }
    const clickedOnCard = activePlayer.cards.find(card => targetCardElement.getAttribute("src")?.includes(card.src));
    if (clickedOnCard !== undefined) {
        processClickOnRealPlayerCard(clickedOnCard, targetCardElement, playState);
    }
    if (targetCardElement === document.querySelector(".stock")) {
        processClickOnStock(playState);
    }
}
function refillStockIfNessesary(playState) {
    if (playState.stock.length !== 0) {
        return;
    }
    playState.stock = playState.discardPile.reverse();
    playState.discardPile = [];
    const dicardPileTop = playState.stock.shift();
    if (dicardPileTop !== undefined) {
        playState.discardPile.push(dicardPileTop);
    }
}
function createElement(tagName, options) {
    const element = document.createElement(tagName);
    if (options === undefined) {
        return element;
    }
    if (options.elClass !== undefined) {
    }
    // element.innerHTML = "Active suit: ";
    // element.appendChild(activeSuit);
    // userGuide.appendChild(element);
    return element;
}
function updateUserGuide(playState) {
    let userGuide = document.querySelector("ul" + DOT + USER_GUIDE);
    if (userGuide === null) {
        userGuide = document.createElement("ul");
        userGuide.setAttribute("class", USER_GUIDE);
        document.querySelector(".play-state")?.appendChild(userGuide);
    }
    let activeSuit = document.querySelector(IMG + DOT + ACTIVE_SUIT);
    if (activeSuit === null) {
        activeSuit = document.createElement(IMG);
        activeSuit.setAttribute("class", ACTIVE_SUIT);
        const activeSuitListItem = document.createElement(LI);
        activeSuitListItem.innerHTML = "Active suit: ";
        activeSuitListItem.appendChild(activeSuit);
        userGuide.appendChild(activeSuitListItem);
    }
    activeSuit.setAttribute(SRC, `images/${playState.activeSuit}.png`);
    const activePlayer = playState.players[playState.currentPlayerIndex];
    const activePlayerStr = activePlayer.isReal
        ? "you"
        : activePlayer.selector.substring(activePlayer.selector.indexOf("-") + 1);
    let activePlayerListItem = document.querySelector(LI + DOT + ACTIVE_PLAYER);
    if (activePlayerListItem === null) {
        activePlayerListItem = document.createElement(LI);
        activePlayerListItem.setAttribute("class", ACTIVE_PLAYER);
        userGuide.appendChild(activePlayerListItem);
    }
    activePlayerListItem.innerHTML = `Active player: ${activePlayerStr}`;
    let nextDrawAmountListItem = document.querySelector(LI + DOT + NEXT_DRAW_AMOUNT);
    if (nextDrawAmountListItem === null) {
        nextDrawAmountListItem = document.createElement(LI);
        nextDrawAmountListItem.setAttribute("class", NEXT_DRAW_AMOUNT);
        userGuide.appendChild(nextDrawAmountListItem);
    }
    nextDrawAmountListItem.innerHTML = `Next draw amount: ${playState.nextStockDrawAmount}`;
}
function prepareForNextPlayerTurn(playState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    let wasPlayerRemoved = false;
    if (activePlayer.cards.length === 0) {
        if (activePlayer.isReal) {
            if (playState.players.length === 4) {
                renderWinModal();
            }
            else {
                renderFinishModal();
            }
            return;
        }
        else {
            playState.players.splice(playState.currentPlayerIndex, 1);
            if (playState.players.length === 1) {
                renderLossModal();
                return;
            }
            wasPlayerRemoved = true;
        }
    }
    updateNextStockDrawAmount(playState);
    playState.currentPlayerIndex = (playState.currentPlayerIndex + (wasPlayerRemoved ? 0 : 1)) % playState.players.length;
    if (!playState.players[playState.currentPlayerIndex].isReal) {
        setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT, playState);
    }
    else {
        if (playState.discardPile.at(-1)?.rank === ACE && playState.isCardEffectOn) {
            renderSkipTurnButton();
        }
    }
    updateUserGuide(playState);
}
function renderSkipTurnButton() {
    const buttonElement = document.querySelector("button.button");
    buttonElement.style.display = "inline";
}
function renderSuitChoiceModal(playState) {
    const paragraph = createParagraphElement("Choose the suit that must be played next:");
    const imageElements = document.createElement("div");
    for (let imgSrc of ["images/heart.png", "images/spade.png", "images/diamond.png", "images/club.png"]) {
        imageElements.appendChild(createSuitChoiceImageElement(imgSrc, playState));
    }
    document.querySelector(".playboard")?.appendChild(createSuitChoiceModalElement([paragraph, imageElements]));
}
function isHtmlDivElement(element) {
    return element.tagName === "DIV";
}
function createSuitChoiceImageElement(imgSrc, playState) {
    const imgElement = document.createElement("img");
    imgElement.setAttribute("src", imgSrc);
    imgElement.style.maxHeight = "4em";
    imgElement.style.margin = "0.3em";
    imgElement.addEventListener("click", (evt) => {
        const target = evt.target;
        const imgSrc = target.getAttribute("src") ?? "";
        playState.activeSuit = imgSrc.substring(imgSrc.indexOf("/") + 1, imgSrc.indexOf("."));
        document.querySelectorAll(".modal").forEach(modal => {
            if (isHtmlDivElement(modal)) {
                modal.style.display = "none";
            }
            prepareForNextPlayerTurn(playState);
        });
    });
    return imgElement;
}
function createSuitChoiceModalElement(suitChoiceModalContentChildren) {
    const suitChoiceModalElement = document.createElement("div");
    suitChoiceModalElement.setAttribute("class", "modal");
    suitChoiceModalElement.style.display = "flex";
    suitChoiceModalElement.appendChild(createSuitChoiceModalContentElement(suitChoiceModalContentChildren));
    return suitChoiceModalElement;
}
function createSuitChoiceModalContentElement(children) {
    const suitChoiceModalContentElement = document.createElement("div");
    suitChoiceModalContentElement.setAttribute("class", "modal__content");
    suitChoiceModalContentElement.style.alignItems = "flex-start";
    children.forEach(child => suitChoiceModalContentElement.appendChild(child));
    return suitChoiceModalContentElement;
}
function renderNewCardOnDiscardPile(playState) {
    document.querySelector(".discard-pile")
        ?.setAttribute("src", playState.discardPile.at(-1)?.src ?? FACE_DOWN_CARD_SRC);
}
function renderWinModal() {
    renderRoundFinishModal("modal__content modal__content--win", "close-btn close-btn--win", "You won!");
}
function renderLossModal() {
    renderRoundFinishModal("modal__content modal__content--loss", "close-btn close-btn--loss", "It does not matter how slowly you go, as long as you don\’t stop");
}
function renderFinishModal() {
    renderRoundFinishModal("modal__content modal__content--finish", "close-btn close-btn--finish", "You finished");
}
function renderRoundFinishModal(roundFinishModalContentClass, roundFinishModalCloseButtonClass, paragraphText) {
    let roundFinishModalElement = document.querySelector(".modal");
    if (roundFinishModalElement === null) {
        roundFinishModalElement = document.createElement("div");
        roundFinishModalElement.setAttribute("class", "modal");
        document.querySelector(".play-board")?.appendChild(roundFinishModalElement);
    }
    let roundFinishModalContentElement = document.querySelector(".modal__content");
    if (roundFinishModalContentElement === null) {
        roundFinishModalContentElement = document.createElement("div");
        roundFinishModalContentElement.setAttribute("class", "modal__content");
        roundFinishModalElement.appendChild(roundFinishModalContentElement);
    }
    let roundFinishModalCloseButtonElement = document.querySelector(".close-btn");
    if (roundFinishModalCloseButtonElement === null) {
        roundFinishModalCloseButtonElement = document.createElement("span");
        roundFinishModalCloseButtonElement.setAttribute("class", ".close-btn");
        roundFinishModalCloseButtonElement.innerHTML = "&times;";
        const roundFinishModalCloseButtonParentDivElement = document.createElement("div");
        roundFinishModalCloseButtonParentDivElement.setAttribute("class", "modal__close-btn");
        roundFinishModalCloseButtonParentDivElement.appendChild(roundFinishModalCloseButtonElement);
        roundFinishModalContentElement.appendChild(roundFinishModalCloseButtonParentDivElement);
    }
    if (isHtmlDivElement(roundFinishModalElement)) {
        roundFinishModalElement.style.display = "flex";
    }
    roundFinishModalContentElement.setAttribute("class", roundFinishModalContentClass);
    roundFinishModalContentElement.appendChild(createParagraphElement(paragraphText));
    roundFinishModalCloseButtonElement.setAttribute("class", roundFinishModalCloseButtonClass);
    roundFinishModalCloseButtonElement.addEventListener("click", () => {
        if (roundFinishModalElement !== null && isHtmlDivElement(roundFinishModalElement)) {
            roundFinishModalElement.style.display = "none";
        }
        endRound();
        beginRound();
    }, { signal: abortController.signal });
    window.addEventListener("click", (event) => {
        if (event.target === roundFinishModalElement
            && event.target !== roundFinishModalContentElement
            && roundFinishModalElement !== null
            && isHtmlDivElement(roundFinishModalElement)) {
            roundFinishModalElement.style.display = "none";
            endRound();
            beginRound();
        }
    }, { signal: abortController.signal });
}
function createParagraphElement(paragraphText) {
    const paragraphElement = document.createElement("p");
    paragraphElement.innerHTML = paragraphText;
    return paragraphElement;
}
function renderCard(player, card, playState) {
    const cardElement = document.createElement("img");
    if (player.isReal) {
        cardElement.setAttribute("src", card.src);
        cardElement.setAttribute("class", "card");
        cardElement.addEventListener("click", (evt) => {
            const target = evt.target;
            makeTurnRealPlayer(target, playState);
            if (target.getAttribute("src")?.includes(ACE)) {
                const skipTurnButton = document.querySelector("button.button");
                if (skipTurnButton !== null) {
                    skipTurnButton.style.display = "none";
                }
            }
        });
    }
    else {
        cardElement.setAttribute("src", player.selector.includes("top") ? FACE_DOWN_CARD_SRC : FACE_DOWN_ROTATED_CARD_SRC);
        cardElement.setAttribute("class", `card${player.selector.includes("top") ? "" : " rotated"}`);
    }
    document.querySelector(player.selector)?.appendChild(cardElement);
}
function renderInitialRoundState(playState) {
    for (let player of playState.players) {
        for (let i = 0; i < player.cards.length; ++i) {
            renderCard(player, player.cards[i], playState);
        }
    }
    document.querySelector(DOT + DISCARD_PILE)
        ?.setAttribute(SRC, playState.discardPile.at(-1)?.src ?? FACE_DOWN_CARD_SRC);
    const skipTurnButtonElement = document.querySelector(BUTTON + DOT + BUTTON);
    document.querySelector(DOT + STOCK)?.addEventListener(CLICK, (evt) => {
        const target = evt.target;
        makeTurnRealPlayer(target, playState);
        skipTurnButtonElement.style.display = "none";
    }, { signal: abortController.signal });
    skipTurnButtonElement.addEventListener(CLICK, () => {
        if (playState.players[playState.currentPlayerIndex].isReal) {
            skipTurnButtonElement.style.display = "none";
            playState.isCardEffectOn = false;
            prepareForNextPlayerTurn(playState);
        }
    }, { signal: abortController.signal });
}
function beginRound() {
    const playState = {
        stock: DECK
            .map(card => ({ card, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ card }) => card),
        discardPile: [],
        players: [],
        currentPlayerIndex: 0,
        isCardEffectOn: false,
        activeSuit: SUITS[0],
        nextStockDrawAmount: 1
    };
    const discardPileTopCard = playState.stock.pop();
    if (discardPileTopCard === undefined) {
        throw Error("Play state stock is empty! DECK is probably incorrectly initialised");
    }
    playState.discardPile.push(discardPileTopCard);
    playState.isCardEffectOn = discardPileTopCard.rank === ACE || discardPileTopCard.rank === SEVEN;
    playState.activeSuit = discardPileTopCard.suit;
    for (let selector of [".artificial-left", ".artificial-top", ".artificial-right", ".real"]) {
        playState.players.push(createPlayer(selector === ".real", takeFourCards(playState.stock), selector));
    }
    renderInitialRoundState(playState);
    updateUserGuide(playState);
    setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT, playState);
}
function endRound() {
    //Remove all player cards
    const topCardElements = document.querySelectorAll(".artificial-top > .card");
    topCardElements.forEach(el => el.remove());
    const leftCardElements = document.querySelectorAll(".artificial-left > .card");
    leftCardElements.forEach(el => el.remove());
    const rightCardElements = document.querySelectorAll(".artificial-right > .card");
    rightCardElements.forEach(el => el.remove());
    const realCardElements = document.querySelectorAll(".real > .card");
    realCardElements.forEach(el => el.remove());
    //Remove all event listeners
    abortController.abort();
    abortController = new AbortController();
    //Restore modal configurations
    document.querySelector(".modal__content")?.setAttribute("class", "modal__content");
    document.querySelector(".close-btn")?.setAttribute("class", "close-btn");
    document.querySelector(".modal__content > p")?.remove();
}
beginRound();
