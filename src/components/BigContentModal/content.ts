import { useCallback, type FunctionComponent } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import type {
  BigContentModalContentProps,
  BigContentModalType,
} from "../../utils/types";
import { ContactForm } from "./ContactForm";
import { TourFinished } from "./TourFinished";

const MODAL_CONTENT: Record<
  BigContentModalType,
  FunctionComponent<BigContentModalContentProps>
> = {
  contact: ContactForm,
  finished: TourFinished,
};

export function useGetBigContentModalPresentationLayer() {
  const { bigContentModal, setNavigation } = useNavigation();
  const handleClose = useCallback(() => {
    setNavigation((navState) => ({ ...navState, bigContentModal: undefined }));
  }, [setNavigation]);

  if (!bigContentModal) {
    return {
      ContentComponent: null,
      handleClose,
    };
  }
  if (!["contact", "finished"].includes(bigContentModal)) {
    console.error("Modal type not supported ", bigContentModal);
    return {
      ContentComponent: null,
      handleClose,
    };
  }

  return {
    ContentComponent: MODAL_CONTENT[bigContentModal],
    handleClose,
  };
}
