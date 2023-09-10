import { Modal, SuitChoiceModal } from "../ui/Modal";
import { GameResult } from "../types/game-result";
import { Game } from "./Game";
import { useEffect, useState } from "react";

export function App() {
  const [beginRound, setBeginRound] = useState(true);
  const [renderFinishModal, setRenderFinishModal] = useState<{
    modalContentClass: string;
    closeBtnClass: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (beginRound) {
      setBeginRound(false);
    }
  });

  const handleGameFinish = (result: GameResult) => {
    switch (result) {
      case "USER_WON": {
        setRenderFinishModal({
          modalContentClass: "modal__content modal__content--win",
          closeBtnClass: "close-btn close-btn--win",
          text: "You won!",
        });
        break;
      }
      case "USER_LOST": {
        setRenderFinishModal({
          modalContentClass: "modal__content modal__content--loss",
          closeBtnClass: "close-btn close-btn--loss",
          text: "It does not matter how slowly you go, as long as you don’t stop",
        });
        break;
      }
      case "USER_FINISHED": {
        setRenderFinishModal({
          modalContentClass: "modal__content modal__content--finish",
          closeBtnClass: "close-btn close-btn--finish",
          text: "You finished",
        });
        break;
      }
    }
  };

  const handleModalClose = () => {
    setBeginRound(true);
    setRenderFinishModal(null);
  };

  return (
    <>
      {!renderFinishModal && (
        <Game onGameFinish={handleGameFinish} isNewRound={beginRound} />
      )}
      {renderFinishModal && (
        <Modal
          modalContentClass={renderFinishModal.modalContentClass}
          closeBtnClass={renderFinishModal.closeBtnClass}
          text={renderFinishModal.text}
          onClick={handleModalClose}
        />
      )}
    </>
  );
}
