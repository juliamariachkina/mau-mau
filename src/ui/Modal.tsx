import { Suit } from "../types/card";
import { getSuitImage } from "../utility/Utility";

export function Modal(props: Readonly<{
  modalContentClass: string;
  closeBtnClass: string;
  text: string;
  onClick: () => void;
}>) {
  return (
    <div className="modal" onClick={props.onClick}>
      <div
        className={props.modalContentClass}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={props.closeBtnClass} onClick={props.onClick}>
          &times;
        </span>
        {props.text}
      </div>
    </div>
  );
}

export function SuitChoiceModal(props: Readonly<{
  onSuitImageClick: (target: HTMLImageElement) => void;
}>) {
  return (
    <div className="modal">
      <div className="modal__content">
        <p>Choose the suit that must be played next:</p>
        <div>
          {(["club", "heart", "spade", "diamond"] as Suit[]).map((suit) => (
            <img
              className="modal__content__suit-img"
              src={getSuitImage(suit)}
              alt={suit}
              onClick={(e) =>
                props.onSuitImageClick(e.target as HTMLImageElement)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
