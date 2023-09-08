import { ReactElement, ReactNode } from "react";

export function PlayBoardArea(props: Readonly<{ position: string, children: ReactNode }>) {
    return <div className={props.position}>{props.children}</div>;
}