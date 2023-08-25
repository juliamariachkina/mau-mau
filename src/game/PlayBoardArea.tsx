import { ReactElement, ReactNode } from "react";

export function PlayBoardArea(props: { position: string, children: ReactNode }) {
    return <div className={props.position}>{props.children}</div>;
}