import { ReactElement } from "react";

export function PlayBoardArea(props: { position: string, children: ReactElement | ReactElement[] }) {
    return <div className={props.position}>{props.children}</div>;
}