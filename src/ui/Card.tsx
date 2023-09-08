import { Card } from "../types/card";

export function Card(props: Readonly<{ src: string; className: string; onClick: any }>) {
  return (
    <img src={props.src} className={props.className} onClick={props.onClick} />
  );
}
