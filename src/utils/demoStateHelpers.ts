import type { EngineTargetState, TourEngine } from "./engineTypesScratch";
import type {
  BigContentModalType,
  EngineFrames,
  NavigationState,
  StepItem,
  TourSelectionItem,
} from "./types";

export function createExpandedDrawerItemIds(
  step: number,
  subStep: number,
  currentItemIsVizualization: boolean
): string[] {
  const expanded: string[] = [];

  if (step !== -1) {
    expanded.push(`${step}`);
  }
  if (subStep !== -1) {
    if (currentItemIsVizualization) {
      expanded.push(`${step}-${subStep - 1}`);
      return expanded;
    }
    expanded.push(`${step}-${subStep}`);
  }

  return expanded;
}

export function createDrawerItems(
  onTourSelect: (selectedTour: string) => void,
  tourConfigs: TourEngine[] | null,
  tour: string
): undefined | TourSelectionItem[] | StepItem[] {
  if (!tourConfigs) return undefined;
  if (!tour) {
    return tourConfigs.map((tour, index) => {
      const { coming_soon, id, ...rest } = tour;

      return {
        ...rest,
        id,
        itemId: index.toString(),
        comingSoon: !!coming_soon,
        ...(!tour.coming_soon ? { onTourSelect: () => onTourSelect(id) } : {}),
      };
    }) as TourSelectionItem[];
  }
  const selectedTour = tourConfigs.find((t) => t.id === tour);
  if (!selectedTour) return undefined;

  return selectedTour.steps.map((step, index) => {
    return {
      ...step,
      itemId: index.toString(),
      subSteps: step.subSteps
        .filter((subStep) => !subStep.visualizationModal)
        .map((subStep, idx) => {
          return {
            ...subStep,
            itemId: `${index}-${idx}`,
          };
        }),
    };
  }) as StepItem[];
}

export function onTreeItemClick(
  stepId: string,
  step: number,
  subStep: number,
  setNavState: (navState: Partial<NavigationState>) => void
) {
  const [stepIndexString, subStepIndexString] = stepId.split("-");
  const selectedStepIndex = parseInt(stepIndexString);
  if (subStepIndexString !== undefined) {
    const selectedSubStepIndex = parseInt(subStepIndexString);
    const isToggle = selectedSubStepIndex === subStep;
    setNavState({
      subStep: isToggle ? -1 : selectedSubStepIndex,
    });
    return;
  }
  const isToggle = selectedStepIndex === step;
  setNavState({ step: isToggle ? -1 : selectedStepIndex });
}

const emptyEngineData = {
  targetState: {},
  animation: [],
  prevTargetState: {},
};

export function getCurrentEngineData(
  tour: string,
  tourConfigs: TourEngine[] | null,
  step: number,
  subStep: number
): {
  targetState: EngineTargetState;
  animation: EngineFrames["Any"][];
  prevTargetState: EngineTargetState;
} {
  const currentTour = tourConfigs?.find((t) => t.id === tour);
  if (!currentTour || subStep === -1 || step === -1) {
    return emptyEngineData;
  }

  const currentStep = currentTour.steps[step];

  let currentSubStep = currentStep.subSteps[subStep];

  if (currentSubStep.visualizationModal) {
    // TODO: handle the possibility that the previous subStep was also a visualizationModal
    currentSubStep = currentStep.subSteps[subStep - 1];
  }

  let prevTargetState: EngineTargetState = emptyEngineData.prevTargetState;

  if (currentSubStep.initialState) {
    prevTargetState = currentSubStep.initialState;
  } else {
    outerLoop: for (let i = step; i >= 0; i--) {
      for (
        let j =
          i === step ? subStep - 1 : currentTour.steps[i].subSteps.length - 1;
        j >= 0;
        j--
      ) {
        const previous = currentTour.steps[i].subSteps[j];
        if (previous?.targetState) {
          prevTargetState = previous.targetState;

          break outerLoop;
        }
      }
    }
  }

  return {
    targetState: currentSubStep.targetState ?? emptyEngineData.targetState,
    animation: currentSubStep.animation ?? emptyEngineData.animation,
    prevTargetState,
  };
}

export function determineNextButtonText(
  tour: string,
  tourConfigs: TourEngine[] | null,
  step: number,
  subStep: number
): string {
  const currentTour = tourConfigs?.find((t) => t.id === tour);
  if (!currentTour || subStep === -1) {
    return "Next";
  }

  const currentStep = currentTour.steps[step];

  if (subStep === currentStep.subSteps.length - 1) {
    const nextStep = currentTour.steps[step + 1];
    const nextStepFirstSubStep = nextStep.subSteps[0];

    if (nextStepFirstSubStep.visualizationModal) {
      return "See results";
    }
  }

  if (currentStep.subSteps[subStep + 1]?.visualizationModal) {
    return "See results";
  }

  return "Next";
}

export function determineNextNavState(
  tour: string,
  tourConfigs: TourEngine[] | null,
  step: number,
  subStep: number
) {
  const currentTour = tourConfigs?.find((t) => t.id === tour);
  if (!currentTour) {
    return null;
  }

  const currentStep = currentTour.steps[step];
  if (subStep === currentStep.subSteps.length - 1) {
    if (step === currentTour.steps.length - 1) {
      return {
        tour: "",
        step: -1,
        subStep: -1,
        bigContentModal: null,
      };
    }
    return {
      tour,
      step: step + 1,
      subStep: 0,
      bigContentModal: null,
    };
  }

  const nextSubStep = currentStep.subSteps[subStep + 1];

  return {
    tour,
    step,
    subStep: subStep + 1,
    bigContentModal: nextSubStep.visualizationModal
      ? ("results" as BigContentModalType)
      : null,
  };
}

export function determinePreviousNavState(
  tour: string,
  tourConfigs: TourEngine[] | null,
  step: number,
  subStep: number
) {
  const currentTour = tourConfigs?.find((t) => t.id === tour);
  if (!currentTour) {
    return null;
  }

  if (subStep === 0) {
    if (step === 0) {
      return {
        tour: "",
        step: -1,
        subStep: -1,
        bigContentModal: null,
      };
    }

    const prevStep = currentTour.steps[step - 1];
    const lastSubStep = prevStep.subSteps[prevStep.subSteps.length - 1];
    return {
      tour,
      step: step - 1,
      subStep: currentTour.steps[step - 1].subSteps.length - 1,
      bigContentModal: lastSubStep.visualizationModal
        ? ("results" as BigContentModalType)
        : null,
    };
  }

  return {
    tour,
    step,
    subStep: subStep - 1,
    bigContentModal: null,
  };
}
