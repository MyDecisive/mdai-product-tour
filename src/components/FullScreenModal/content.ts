import { useCallback, type FunctionComponent } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import type {
  FullScreenModalContentProps,
  FullScreenModalType,
} from "../../utils/types";
import { ContactForm } from "./ContactForm";
import { TourFinished } from "./TourFinished";

const MODAL_TITLES: Record<FullScreenModalType, string> = {
  contact: "Contact Us",
  finished: "Not the end of the road",
};

const MODAL_CONTENT: Record<
  FullScreenModalType,
  FunctionComponent<FullScreenModalContentProps>
> = {
  contact: ContactForm,
  finished: TourFinished,
};

export function useGetFullScreenModalPresentationLayer() {
  const { fullScreenModal, setNavigation } = useNavigation();
  const handleClose = useCallback(() => {
    setNavigation((navState) => ({ ...navState, fullScreenModal: undefined }));
  }, []);

  if (!fullScreenModal) {
    return {
      title: null,
      ContentComponent: null,
      handleClose,
    };
  }
  if (!["contact", "finished"].includes(fullScreenModal)) {
    console.error("Modal type not supported ", fullScreenModal);
    return {
      title: null,
      ContentComponent: null,
      handleClose,
    };
  }

  return {
    title: MODAL_TITLES[fullScreenModal],
    ContentComponent: MODAL_CONTENT[fullScreenModal],
    handleClose,
  };
}
