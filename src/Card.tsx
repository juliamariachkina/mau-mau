import { getImageSrc } from "./Utility";
import { Card } from './types/card';

export function Card(props: { src: string, className: string, onClick: any }) {
    return <img src={props.src} className={props.className} onClick={props.onClick} />
}