import cardBackRotatd from "../images/card-back-rotated.png";

import { PlayBoardArea } from "./PlayBoardArea";
import { Player } from "./Player";
import { PlayState } from "./PlayState";
import { Button } from "./Button";

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