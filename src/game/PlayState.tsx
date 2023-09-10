import cardBack from "../../images/card-back.png";
import { UserGuide } from "./UserGuide";
import { Card as CardType, Suit } from "../types/card";
import { Player } from "../types/player";
import { getImageSrc } from "../utility/Utility";
import { MouseEventHandler } from "react";

export function PlayState(props: Readonly<{
  discardPileTopSrc: string;
  onStockClick: MouseEventHandler<HTMLImageElement>;
  activeSuit: Suit;
  activePlayer: Player;
  nextDrawCount: number;
}>) {
  return (
    <div className="play-state">
      <div className="play-state-cards">
        <PlayStateCard
          className="stock"
          src={cardBack}
          onClick={props.onStockClick}
        />
        <PlayStateCard
          className="discard-pile"
          src={props.discardPileTopSrc}
          onClick={() => {}}
        />
      </div>
      <UserGuide
        activeSuit={props.activeSuit}
        activePlayer={props.activePlayer}
        nextDrawCount={props.nextDrawCount}
      />
    </div>
  );
}

export function PlayStateCard(props: Readonly<{
  src: string;
  className: string;
  onClick: MouseEventHandler<HTMLImageElement>;
}>) {
  return (
    <img
      className={"card " + props.className}
      src={props.src}
      onClick={props.onClick}
    />
  );
}
