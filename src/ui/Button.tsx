export function Button(props: Readonly<{ text: string, onClick: () => void }>) {
    return <button type="button" className="button" onClick={props.onClick}>{props.text}</button>
}