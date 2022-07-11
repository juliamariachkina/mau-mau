import { ReactElement, ReactNode } from "react";
import cardBack from "../images/card-back.png";

export function App(props: {}) {
    return (
        <>
            <PlayBoardArea position="top">
                <Player isReal={false} position="top" />
            </PlayBoardArea>
            <PlayBoardArea position="center">
                <Player isReal={false} position="left" />
                <PlayState />
                <Player isReal={false} position="right" />
            </PlayBoardArea>
            <PlayBoardArea position="bottom">
                <Button text="Skip turn" />
                <Player isReal position="" />
            </PlayBoardArea>
        </>
    );
}

function PlayBoardArea(props: { position: string, children: ReactElement | ReactElement[] }) {
    return <div className={props.position}>{props.children}</div>;
}

function Player(props: { isReal: boolean, position: string }) {
    const className = props.isReal
        ? "real-player"
        : "artificial-player-" + props.position;
    return <div className={className}></div>;
}

function PlayState(props: {}) {
    return (
        <div className="play-state">
            <div className="play-state-cards">
                <PlayStateCard className="stock" src={cardBack} />
                <PlayStateCard className="discard-pile" src={cardBack} />
            </div>
            <UserGuide />
        </div>
    );
}

function PlayStateCard(props: { src: string, className: string }) {
    return <img className={"card " + props.className} src={props.src} />;
}

function UserGuide(props: {}) {
    return (
        <ul className="user-guide">
            <li key="suit">Active suit: <img className="active-suit" /></li>
            <li key="active-player" className="active-player"></li>
            <li key="draw-amount" className="next-draw-amount"></li>
        </ul>
    );
}

function Button(props: { text: string }) {
    return <button type="button" className="button">{props.text}</button>
}