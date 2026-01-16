import { useCallback, type FunctionComponent } from "react";
import { useDemoContext } from "../../hooks/useDemoContext";
import type { BigContentModalType } from "../../types/steps";
import { StepResults } from "./StepResults";
import { TourFinished } from "./TourFinished";

const MODAL_CONTENT: Record<
  BigContentModalType,
  FunctionComponent<{ handleClose: () => void }>
> = {
  finished: TourFinished,
  results: StepResults,
};

export function useGetBigContentModalContent() {
  const {
    navigationState: { bigContentModal },
    setNavState,
  } = useDemoContext();

  const handleClose = useCallback(() => {
    setNavState({ bigContentModal: null });
  }, [setNavState]);

  if (!bigContentModal) {
    return {
      ContentComponent: null,
      handleClose,
    };
  }
  if (!["finished", "results"].includes(bigContentModal)) {
    console.error("Modal type not supported ", bigContentModal);
    return {
      ContentComponent: null,
      handleClose,
    };
  }

  return {
    ContentComponent: MODAL_CONTENT[bigContentModal],
    handleClose,
    showCloseButton: bigContentModal === "finished",
  };
}
