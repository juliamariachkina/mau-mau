import { Suit } from "./types/card";
import { getSuitImage } from "./Utility";
import { Player } from "./types/player";

export function UserGuide(props: { activeSuit: Suit, activePlayer: Player, nextDrawCount: number }) {
    const activePlayerStr = props.activePlayer.isReal
        ? "you"
        : props.activePlayer.position;
    return (
        <ul className="user-guide">
            <li key="suit">Active suit: <img className="active-suit" src={getSuitImage(props.activeSuit)} /></li>
            <li key="active-player" className="active-player">Active player: {activePlayerStr}</li>
            <li key="draw-amount" className="next-draw-amount">Next draw count: {props.nextDrawCount}</li>
        </ul>
    );
}