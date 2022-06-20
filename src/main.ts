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
const DIV = "div";
const CLASS = "class";
const CARD = "card";
const PLAYER_SELECTORS = [".artificial-left", ".artificial-top", ".artificial-right", ".real"];

let abortController = new AbortController();


const FACE_DOWN_CARD_SRC = "images/card-back.png";
const FACE_DOWN_ROTATED_CARD_SRC = "images/card-back-rotated.png";
const PLAYER_TURN_TIMEOUT = 1200;
const SUITS = ["spade", "diamond", "club", "heart"];
const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const ACE = "A";
const SEVEN = "7";
const JACK = "J";

interface Card {
    suit: string,
    rank: string,
    src: string
}

interface Player {
    isReal: boolean,
    cards: Card[],
    selector: string
}

interface PlayState {
    stock: Card[],
    discardPile: Card[],
    players: Player[],
    currentPlayerIndex: number,
    isCardEffectOn: boolean,
    activeSuit: string,
    nextStockDrawAmount: number
}

const DECK: Card[] = [];
for (const suit of SUITS) {
    for (const rank of RANKS) {
        DECK.push(createCard(suit, rank));
    }
}

function createCard(suit: string, rank: string): Card {
    return {
        suit,
        rank,
        src: `images/${suit}${rank}.png`
    }
}

function createPlayer(isReal: boolean, cards: Card[], selector: string): Player {
    return {
        isReal,
        cards,
        selector
    }
}

function takeFourCards(stock: Card[]): Card[] {
    const fourCards = stock.slice(-4);
    for (let i: number = 0; i < 4; ++i) {
        stock.pop();
    }
    return fourCards;
}

function canBePlayedOn(card: Card, playState: PlayState): boolean {
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

function updateNextStockDrawAmount(playState: PlayState) {
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

function makeTurnArtificialPlayer(playState: PlayState) {
    if (!tryPlayCardArtificialPlayer(playState)) {
        drawFromStock(playState);
    }
    prepareForNextPlayerTurn(playState);
}

function drawFromStock(playState : PlayState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    let stockDrawAmount = playState.nextStockDrawAmount;
    while (stockDrawAmount > 0) {
        let drawnCard = playState.stock.pop();
        if (drawnCard === undefined) {
            refillStockIfNessesary(playState);
            drawnCard = playState.stock.pop();
            if (drawnCard === undefined) {
                throw new Error("Can't refill stock");
            }
        }
        activePlayer.cards.push(drawnCard);
        renderCard(activePlayer, drawnCard, playState);
        stockDrawAmount--;
    }
    playState.isCardEffectOn = false;
}

function tryPlayCardArtificialPlayer(playState: PlayState): boolean {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    const card = activePlayer.cards.find(c => canBePlayedOn(c, playState));
    if (card === undefined) { return false; }

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

    const playerCardElements = document.querySelectorAll(`${activePlayer.selector} ${DOT}${CARD}`);
    playerCardElements[playerCardElements.length - 1].remove();
    return true;
}

function processClickOnRealPlayerCard(clickedOnCard: Card, targetCardElement: HTMLElement, playState: PlayState) {
    if (!canBePlayedOn(clickedOnCard, playState)) { return; }

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

function makeTurnRealPlayer(targetCardElement: HTMLElement, playState: PlayState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    if (!activePlayer.isReal) { return; }

    const clickedOnCard = activePlayer.cards.find(card => targetCardElement.getAttribute("src")?.includes(card.src));
    if (clickedOnCard !== undefined) {
        processClickOnRealPlayerCard(clickedOnCard, targetCardElement, playState);
    }
    if (targetCardElement === document.querySelector(".stock")) {
        drawFromStock(playState);
        prepareForNextPlayerTurn(playState);
    }
}

function refillStockIfNessesary(playState: PlayState) {
    if (playState.stock.length !== 0) { return; }
    playState.stock = playState.discardPile.reverse();
    playState.discardPile = [];
    const dicardPileTop = playState.stock.shift();
    if (dicardPileTop !== undefined) {
        playState.discardPile.push(dicardPileTop);
    }
}

function createElement(tagName: string, 
    options?: { attributes?: Map<string, string>, innerHtml?: string, parent?: Element | null }): HTMLElement {
    const element = document.createElement(tagName);
    if (options === undefined) {
        return element;
    }
    if (options.attributes !== undefined) {
        options.attributes.forEach(
            (value, qualifiedName) => element.setAttribute(qualifiedName, value));
    }
    if (options.innerHtml !== undefined) {
        element.innerHTML = options.innerHtml;
    }
    if (options.parent !== undefined && options.parent !== null) {
        options.parent.appendChild(element);
    }
    return element;
}

function updateUserGuide(playState: PlayState) {
    let userGuide = document.querySelector("ul" + DOT + USER_GUIDE);
    if (userGuide === null) {
        userGuide = createElement("ul", { 
            attributes: new Map().set(CLASS, USER_GUIDE), 
            parent: document.querySelector(".play-state")});
    }
    let activeSuit = document.querySelector(IMG + DOT + ACTIVE_SUIT);
    if (activeSuit === null) {
        const activeSuitListItem = createElement(LI, { innerHtml: "Active suit: ", parent : userGuide});
        activeSuit = createElement(IMG, {attributes : new Map().set(CLASS, ACTIVE_SUIT), parent : activeSuitListItem});
    }
    activeSuit.setAttribute(SRC, `images/${playState.activeSuit}.png`);

    const activePlayer = playState.players[playState.currentPlayerIndex];
    const activePlayerStr = activePlayer.isReal
        ? "you"
        : activePlayer.selector.substring(activePlayer.selector.indexOf("-") + 1);

    let activePlayerListItem = document.querySelector(LI + DOT + ACTIVE_PLAYER);
    if (activePlayerListItem === null) {
        activePlayerListItem = createElement(LI, {attributes : new Map().set(CLASS, ACTIVE_PLAYER), parent : userGuide});
    }
    activePlayerListItem.innerHTML = `Active player: ${activePlayerStr}`;

    let nextDrawAmountListItem = document.querySelector(LI + DOT + NEXT_DRAW_AMOUNT);
    if (nextDrawAmountListItem === null) {
        nextDrawAmountListItem = createElement(LI, {attributes : new Map().set(CLASS, NEXT_DRAW_AMOUNT), parent : userGuide});
    }
    nextDrawAmountListItem.innerHTML = `Next draw amount: ${playState.nextStockDrawAmount}`;
}

function processPlayerFinish(playState : PlayState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    if (activePlayer.isReal) {
        if (playState.players.length === 4) {
            renderWinModal();
        } else {
            renderFinishModal();
        }
    } else {
        playState.players.splice(playState.currentPlayerIndex, 1);
        if (playState.players.length === 1) {
            renderLossModal();
        }
    }
}

function prepareForNextPlayerTurn(playState: PlayState) {
    const activePlayer = playState.players[playState.currentPlayerIndex];
    let wasPlayerRemoved = activePlayer.cards.length === 0;
    if (activePlayer.cards.length === 0) {
        processPlayerFinish(playState);
        if (activePlayer.isReal || playState.players.length === 1) {
            return;
        }
    }
    updateNextStockDrawAmount(playState);
    playState.currentPlayerIndex = (playState.currentPlayerIndex + (wasPlayerRemoved ? 0 : 1)) % playState.players.length;
    if (!playState.players[playState.currentPlayerIndex].isReal) {
        setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT, playState);
    } else {
        if (playState.discardPile.at(-1)?.rank === ACE && playState.isCardEffectOn) {
            renderSkipTurnButton();
        }
    }
    updateUserGuide(playState);
}

function renderSkipTurnButton() {
    const buttonElement = document.querySelector(BUTTON + DOT + BUTTON) as HTMLButtonElement;
    buttonElement.style.display = "inline";
}

function renderSuitChoiceModal(playState: PlayState) {
    const paragraph = createParagraphElement("Choose the suit that must be played next:");
    const imageElements = document.createElement(DIV);
    for (let imgSrc of ["images/heart.png", "images/spade.png", "images/diamond.png", "images/club.png"]) {
        imageElements.appendChild(createSuitChoiceImageElement(imgSrc, playState));
    }

    document.querySelector(".playboard")?.appendChild(createSuitChoiceModalElement([paragraph, imageElements]));
}

function isHtmlDivElement(element: Element): element is HTMLDivElement {
    return element.tagName === DIV;
}

function createSuitChoiceImageElement(imgSrc: string, playState: PlayState) {
    const imgElement = createElement(IMG, {attributes : new Map().set(SRC, imgSrc)});
    imgElement.style.maxHeight = "4em";
    imgElement.style.margin = "0.3em"
    imgElement.addEventListener("click", (evt) => {
        const target = evt.target as HTMLImageElement;
        const imgSrc = target.getAttribute("src") ?? "";
        playState.activeSuit = imgSrc.substring(imgSrc.indexOf("/") + 1, imgSrc.indexOf("."));
        document.querySelectorAll(DOT + MODAL).forEach(modal => {
            if (isHtmlDivElement(modal)) {
                modal.style.display = "none";
            }
            prepareForNextPlayerTurn(playState);
        });
    });
    return imgElement;
}

function createSuitChoiceModalElement(suitChoiceModalContentChildren: HTMLElement[]) {
    const suitChoiceModalElement = createElement(DIV, {attributes : new Map().set(CLASS, MODAL)});
    suitChoiceModalElement.style.display = "flex";
    suitChoiceModalElement.appendChild(createSuitChoiceModalContentElement(suitChoiceModalContentChildren));
    return suitChoiceModalElement;
}

function createSuitChoiceModalContentElement(children: HTMLElement[]) {
    const suitChoiceModalContentElement = createElement(DIV, {attributes : new Map().set(CLASS, MODAL_CONTENT)});
    suitChoiceModalContentElement.style.alignItems = "flex-start";

    children.forEach(child => suitChoiceModalContentElement.appendChild(child));
    return suitChoiceModalContentElement;
}

function renderNewCardOnDiscardPile(playState: PlayState) {
    document.querySelector(DOT + DISCARD_PILE)
        ?.setAttribute(SRC, playState.discardPile.at(-1)?.src ?? FACE_DOWN_CARD_SRC);
}

function renderWinModal() {
    renderRoundFinishModal("modal__content modal__content--win", "close-btn close-btn--win", "You won!");
}

function renderLossModal() {
    renderRoundFinishModal("modal__content modal__content--loss", "close-btn close-btn--loss",
        "It does not matter how slowly you go, as long as you don\’t stop");
}

function renderFinishModal() {
    renderRoundFinishModal("modal__content modal__content--finish", "close-btn close-btn--finish", "You finished");
}

function renderRoundFinishModal(roundFinishModalContentClass: string, roundFinishModalCloseButtonClass: string, paragraphText: string) {
    let roundFinishModalElement = document.querySelector(DOT + MODAL);
    if (roundFinishModalElement === null) {
        roundFinishModalElement = createElement(DIV, 
            {attributes: new Map().set(CLASS, MODAL), parent: document.querySelector(".play-board")});
    }
    if (isHtmlDivElement(roundFinishModalElement)) {
        roundFinishModalElement.style.display = "flex";
    }
    let roundFinishModalContentElement = document.querySelector(DOT + MODAL_CONTENT);
    if (roundFinishModalContentElement === null) {
        roundFinishModalContentElement = createElement(DIV, 
            {attributes : new Map().set(CLASS, MODAL_CONTENT), parent : roundFinishModalElement});
    }
    let roundFinishModalCloseButtonElement = document.querySelector(DOT + CLOSE_BTN);
    if (roundFinishModalCloseButtonElement === null) {
        const roundFinishModalCloseButtonParentDivElement = createElement(DIV, 
            {attributes : new Map().set(CLASS, "modal__close-btn"), parent : roundFinishModalContentElement});
        roundFinishModalCloseButtonElement = createElement("span", 
            {   attributes: new Map().set(CLASS, CLOSE_BTN), 
                innerHtml: "&times;", parent : 
                roundFinishModalCloseButtonParentDivElement });
    }
    roundFinishModalContentElement.setAttribute(CLASS, roundFinishModalContentClass);
    roundFinishModalContentElement.appendChild(createParagraphElement(paragraphText));

    roundFinishModalCloseButtonElement.setAttribute(CLASS, roundFinishModalCloseButtonClass);
    roundFinishModalCloseButtonElement.addEventListener(CLICK, () => {
        if (roundFinishModalElement !== null && isHtmlDivElement(roundFinishModalElement)) {
            roundFinishModalElement.style.display = "none";
        }
        endRound();
        beginRound();
    }, { signal: abortController.signal });
    window.addEventListener(CLICK, (event) => {
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

function createParagraphElement(paragraphText: string) {
    const paragraphElement = document.createElement("p");
    paragraphElement.innerHTML = paragraphText;
    return paragraphElement;
}

function renderCard(player: Player, card: Card, playState: PlayState) {
    const cardElement = document.createElement(IMG);
    if (player.isReal) {
        cardElement.setAttribute(SRC, card.src);
        cardElement.setAttribute(CLASS, CARD);
        cardElement.addEventListener(CLICK, (evt) => {
            const target = evt.target as HTMLImageElement;
            makeTurnRealPlayer(target, playState);
            if (target.getAttribute(SRC)?.includes(ACE)) {
                const skipTurnButton = document.querySelector(BUTTON + DOT + BUTTON) as HTMLButtonElement;
                if (skipTurnButton !== null) {
                    skipTurnButton.style.display = "none";
                }
            }
        });
    } else {
        cardElement.setAttribute(SRC, player.selector.includes("top") ? FACE_DOWN_CARD_SRC : FACE_DOWN_ROTATED_CARD_SRC);
        cardElement.setAttribute(CLASS, `${CARD}${player.selector.includes("top") ? "" : " rotated"}`);
    }
    document.querySelector(player.selector)?.appendChild(cardElement);
}

function renderInitialRoundState(playState: PlayState) {
    for (let player of playState.players) {
        for (let i = 0; i < player.cards.length; ++i) {
            renderCard(player, player.cards[i], playState);
        }
    }
    document.querySelector(DOT + DISCARD_PILE)
        ?.setAttribute(SRC, playState.discardPile.at(-1)?.src ?? FACE_DOWN_CARD_SRC);

    const skipTurnButtonElement = document.querySelector(BUTTON + DOT + BUTTON) as HTMLButtonElement;
    document.querySelector(DOT + STOCK)?.addEventListener(CLICK, (evt) => {
        const target = evt.target as HTMLElement;
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
    const playState: PlayState = {
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
    }
    const discardPileTopCard = playState.stock.pop();
    if (discardPileTopCard === undefined) {
        throw Error("Play state stock is empty! DECK is probably incorrectly initialised");
    }
    playState.discardPile.push(discardPileTopCard);
    playState.isCardEffectOn = discardPileTopCard.rank === ACE || discardPileTopCard.rank === SEVEN;
    playState.activeSuit = discardPileTopCard.suit;
    for (let selector of PLAYER_SELECTORS) {
        playState.players.push(createPlayer(selector === ".real", takeFourCards(playState.stock), selector));
    }

    renderInitialRoundState(playState);
    updateUserGuide(playState);
    setTimeout(makeTurnArtificialPlayer, PLAYER_TURN_TIMEOUT, playState);
}

function endRound() {
    //Remove all player cards
    for (let plSelector of PLAYER_SELECTORS) {
        const cardElements = document.querySelectorAll(plSelector + " > " + DOT + CARD);
        cardElements.forEach(el => el.remove());
    }
    //Remove all event listeners
    abortController.abort();
    abortController = new AbortController();
    //Restore modal configurations
    document.querySelector(DOT + MODAL_CONTENT)?.setAttribute(CLASS, MODAL_CONTENT);
    document.querySelector(DOT + CLOSE_BTN)?.setAttribute(CLASS, CLOSE_BTN);
    document.querySelector(DOT + MODAL_CONTENT + " > p")?.remove();
}

beginRound();
