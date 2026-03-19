import { useCallback, useMemo } from "react";
import { useDemoContext } from "./useDemoContext";

export function useGetDrawerHeaderProps() {
  const {
    tourConfigs,
    setNavState,
    navigationState: { tour },
  } = useDemoContext();

  const inTour = tour !== "";

  const handleExitTour = useCallback(() => {
    setNavState({
      tour: "",
      step: -1,
      subStep: -1,
    });
  }, [setNavState]);

  const drawerHeaderText = useMemo(() => {
    const currentTour = tourConfigs?.find((t) => t.id === tour);
    if (!currentTour) {
      return "MyDecisive Demo";
    }
    return currentTour.title;
  }, [tourConfigs, tour]);

  return {
    inTour,
    drawerHeaderText,
    handleBackButtonClick: handleExitTour,
  };
}
