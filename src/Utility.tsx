import { Card } from "./types/card";

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

export function getImageSrc(card: Card) {
    switch (card) {
        case { suit: "spade", rank: "7" }: return spade7;
        case { suit: "spade", rank: "8" }: return spade8;
        case { suit: "spade", rank: "9" }: return spade9;
        case { suit: "spade", rank: "10" }: return spade10;
        case { suit: "spade", rank: "J" }: return spadeJ;
        case { suit: "spade", rank: "Q" }: return spadeQ;
        case { suit: "spade", rank: "K" }: return spadeK;
        case { suit: "spade", rank: "A" }: return spadeA;
        case { suit: "club", rank: "7" }: return club7;
        case { suit: "club", rank: "8" }: return club8;
        case { suit: "club", rank: "9" }: return club9;
        case { suit: "club", rank: "10" }: return club10;
        case { suit: "club", rank: "J" }: return clubJ;
        case { suit: "club", rank: "Q" }: return clubQ;
        case { suit: "club", rank: "K" }: return clubK;
        case { suit: "club", rank: "A" }: return clubA;
        case { suit: "heart", rank: "7" }: return heart7;
        case { suit: "heart", rank: "8" }: return heart8;
        case { suit: "heart", rank: "9" }: return heart9;
        case { suit: "heart", rank: "10" }: return heart10;
        case { suit: "heart", rank: "J" }: return heartJ;
        case { suit: "heart", rank: "Q" }: return heartQ;
        case { suit: "heart", rank: "K" }: return heartK;
        case { suit: "heart", rank: "A" }: return heartA;
        case { suit: "diamond", rank: "7" }: return diamond7;
        case { suit: "diamond", rank: "8" }: return diamond8;
        case { suit: "diamond", rank: "9" }: return diamond9;
        case { suit: "diamond", rank: "10" }: return diamond10;
        case { suit: "diamond", rank: "J" }: return diamondJ;
        case { suit: "diamond", rank: "Q" }: return diamondQ;
        case { suit: "diamond", rank: "K" }: return diamondK;
        case { suit: "diamond", rank: "A" }: return diamondA;
    }
}