import { MouseEventHandler, useState } from 'react';
import { Card } from './Card';
import { Card as CardType } from './types/card';

export function Player(props: { isReal: boolean, position: string }) {
    const [cards, setCards] = useState<CardType[]>([]);
    if (cards.length === 0) {
        return null;
    }
    const className = props.isReal
        ? "real-player"
        : "artificial-player-" + props.position;
    const handleCardClick: MouseEventHandler<HTMLImageElement> = (e) => {
        const targetSrc = (e.target as HTMLImageElement).getAttribute('src');
        setCards(cards.filter(card => !targetSrc?.includes(card.suit + card.rank)));
    }
    return (
        <div className={className}>
            {cards.map((playerCard, i) => (<Card key={i} card={playerCard} />))}
        </div>
    );
}

