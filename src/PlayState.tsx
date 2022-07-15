import cardBack from "../images/card-back.png";
import { UserGuide } from "./UserGuide";

export function PlayState(props: {}) {
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

export function PlayStateCard(props: { src: string, className: string }) {
    return <img className={"card " + props.className} src={props.src} />;
}