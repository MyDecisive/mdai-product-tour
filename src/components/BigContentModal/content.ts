import { useCallback, type FunctionComponent } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import type {
  FullScreenModalContentProps,
  FullScreenModalType,
} from "../../utils/types";
import { ContactForm } from "./ContactForm";
import { TourFinished } from "./TourFinished";

const MODAL_CONTENT: Record<
  FullScreenModalType,
  FunctionComponent<FullScreenModalContentProps>
> = {
  contact: ContactForm,
  finished: TourFinished,
};

export function useGetBigContentModalPresentationLayer() {
  const { fullScreenModal, setNavigation } = useNavigation();
  const handleClose = useCallback(() => {
    setNavigation((navState) => ({ ...navState, fullScreenModal: undefined }));
  }, []);

  if (!fullScreenModal) {
    return {
      ContentComponent: null,
      handleClose,
    };
  }
  if (!["contact", "finished"].includes(fullScreenModal)) {
    console.error("Modal type not supported ", fullScreenModal);
    return {
      ContentComponent: null,
      handleClose,
    };
  }

  return {
    ContentComponent: MODAL_CONTENT[fullScreenModal],
    handleClose,
  };
}
