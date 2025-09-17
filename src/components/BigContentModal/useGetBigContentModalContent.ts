import { type FunctionComponent } from "react";
import { selectNavigation } from "../../contexts/selectors";
import { useHighlander } from "../../hooks/useHighlander";
import { useSelector } from "../../hooks/useSelector";
import type {
  BigContentModalContentProps,
  BigContentModalType,
} from "../../utils/types";
import { ContactForm } from "./ContactForm";
import { StepResults } from "./StepResults";
import { TourFinished } from "./TourFinished";

const MODAL_CONTENT: Record<
  BigContentModalType,
  FunctionComponent<BigContentModalContentProps>
> = {
  contact: ContactForm,
  finished: TourFinished,
  results: StepResults,
};

export function useGetBigContentModalContent() {
  const { bigContentModal } = useSelector(selectNavigation);
  const { actions } = useHighlander();
  const handleClose = actions.CLOSE_BIG_CONTENT_MODAL;

  if (!bigContentModal) {
    return {
      ContentComponent: null,
      handleClose,
    };
  }
  if (!["contact", "finished", "results"].includes(bigContentModal)) {
    console.error("Modal type not supported ", bigContentModal);
    return {
      ContentComponent: null,
      handleClose,
    };
  }

  return {
    ContentComponent: MODAL_CONTENT[bigContentModal],
    handleClose,
    showCloseButton: bigContentModal !== "results",
  };
}
