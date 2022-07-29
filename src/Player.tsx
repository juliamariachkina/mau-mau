import { MouseEventHandler, useState } from 'react';
import { Card } from './Card';
import { Card as CardType } from './types/card';
import { getImageSrc } from './Utility';

import cardBack from "../images/card-back.png";
import cardBackRotated from "../images/card-back-rotated.png";

export function Player(props: { isReal: boolean, position: string, cards: CardType[], onCardClick: MouseEventHandler<HTMLImageElement> }) {
    const className = props.isReal
        ? "real-player"
        : "artificial-player-" + props.position;
    const cardClassName = props.position === "top"
        ? "card rotated"
        : "card";
    return (
        <div className={className}>
            {props.cards.map((playerCard, i) =>
            (<Card
                key={i}
                src={props.isReal
                    ? getImageSrc(playerCard)
                    : (props.position === "top"
                        ? cardBack
                        : cardBackRotated)}
                className={cardClassName}
                onClick={props.onCardClick} />))}
        </div>
    );
}

