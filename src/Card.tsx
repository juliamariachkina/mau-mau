import { getImageSrc } from "./Utility";
import { Card } from './types/card';

export function Card(props: { card: Card }) {
    return <img src={getImageSrc(props.card)} className="card" />
}