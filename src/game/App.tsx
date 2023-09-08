import { Modal, SuitChoiceModal } from "../ui/Modal";
import { GameResult } from "../types/game-result";
import { Game } from "./Game";
import { useEffect, useState } from "react";

export function App(props: {}) {
  const [beginRound, setBeginRound] = useState(true);
  const [renderFinishModal, setRenderFinishModal] = useState(false);

  useEffect(() => {
    if (beginRound) {
      setBeginRound(false);
    }
  }, [beginRound]);

  let modalContentClass = "";
  let closeBtnClass = "";
  let text = "";

  const handleGameFinish = (result: GameResult) => {
    switch (result) {
      case "USER_WON": {
        modalContentClass = "modal__content modal__content--win";
        closeBtnClass = "close-btn close-btn--win";
        text = "You won!";
        break;
      }
      case "USER_LOST": {
        modalContentClass = "modal__content modal__content--loss";
        closeBtnClass = "close-btn close-btn--loss";
        text =
          "It does not matter how slowly you go, as long as you don’t stop";
        break;
      }
      case "USER_FINISHED": {
        modalContentClass = "modal__content modal__content--finish";
        closeBtnClass = "close-btn close-btn--finish";
        text = "You finished";
        break;
      }
    }
    setRenderFinishModal(true);
  };

  const handleModalClose = () => {
    setBeginRound(true);
    setRenderFinishModal(false);
  };

  return (
    <>
      <Game onGameFinish={handleGameFinish} isNewRound={beginRound} />
      {renderFinishModal && (
        <Modal
          modalContentClass={modalContentClass}
          closeBtnClass={closeBtnClass}
          text={text}
          onClick={handleModalClose}
        />
      )}
    </>
  );
}
