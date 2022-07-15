export function UserGuide(props: {}) {
    return (
        <ul className="user-guide">
            <li key="suit">Active suit: <img className="active-suit" /></li>
            <li key="active-player" className="active-player"></li>
            <li key="draw-amount" className="next-draw-amount"></li>
        </ul>
    );
}