export function Button(props: { text: string, onClick: () => void }) {
    return <button type="button" className="button" onClick={props.onClick}>{props.text}</button>
}