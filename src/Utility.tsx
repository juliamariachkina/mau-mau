import { Card, Suit } from "./types/card";

import cardBack from "../images/card-back.png";
import club from "../images/club.png";
import club7 from "../images/club7.png";
import club8 from "../images/club8.png";
import club9 from "../images/club9.png";
import club10 from "../images/club10.png";
import clubA from "../images/clubA.png";
import clubJ from "../images/clubJ.png";
import clubK from "../images/clubK.png";
import clubQ from "../images/clubQ.png";
import diamond from "../images/diamond.png";
import diamond7 from "../images/diamond7.png";
import diamond8 from "../images/diamond8.png";
import diamond9 from "../images/diamond9.png";
import diamond10 from "../images/diamond10.png";
import diamondA from "../images/diamondA.png";
import diamondJ from "../images/diamondJ.png";
import diamondK from "../images/diamondK.png";
import diamondQ from "../images/diamondQ.png";
import spade from "../images/spade.png";
import spade7 from "../images/spade7.png";
import spade8 from "../images/spade8.png";
import spade9 from "../images/spade9.png";
import spade10 from "../images/spade10.png";
import spadeA from "../images/spadeA.png";
import spadeJ from "../images/spadeJ.png";
import spadeK from "../images/spadeK.png";
import spadeQ from "../images/spadeQ.png";
import heart from "../images/heart.png";
import heart7 from "../images/heart7.png";
import heart8 from "../images/heart8.png";
import heart9 from "../images/heart9.png";
import heart10 from "../images/heart10.png";
import heartA from "../images/heartA.png";
import heartJ from "../images/heartJ.png";
import heartK from "../images/heartK.png";
import heartQ from "../images/heartQ.png";

export function getImageSrc(card: Card | undefined) {
    if (card === undefined) {
        return cardBack;
    }
    switch (card.suit + card.rank) {
        case "spade7": return spade7;
        case "spade8": return spade8;
        case "spade9": return spade9;
        case "spade10": return spade10;
        case "spadeJ": return spadeJ;
        case "spadeQ": return spadeQ;
        case "spadeK": return spadeK;
        case "spadeA": return spadeA;
        case "club7": return club7;
        case "club8": return club8;
        case "club9": return club9;
        case "club10": return club10;
        case "clubJ": return clubJ;
        case "clubQ": return clubQ;
        case "clubK": return clubK;
        case "clubA": return clubA;
        case "heart7": return heart7;
        case "heart8": return heart8;
        case "heart9": return heart9;
        case "heart10": return heart10;
        case "heartJ": return heartJ;
        case "heartQ": return heartQ;
        case "heartK": return heartK;
        case "heartA": return heartA;
        case "diamond7": return diamond7;
        case "diamond8": return diamond8;
        case "diamond9": return diamond9;
        case "diamond10": return diamond10;
        case "diamondJ": return diamondJ;
        case "diamondQ": return diamondQ;
        case "diamondK": return diamondK;
        case "diamondA": return diamondA;
    }
    return cardBack;
}

export function getSuitImage(suit: Suit) {
    switch (suit) {
        case "club": return club;
        case "spade": return spade;
        case "heart": return heart;
        case "diamond": return diamond;
    }
}