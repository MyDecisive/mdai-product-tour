import type { AnyFrame } from "../types/frames";
import type { Player } from "../types/player";
import type {
  Definition,
  NavigationState,
  SelectionItem,
  Step,
} from "../types/steps";

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
  tourConfigs: Definition[] | null,
  tour: string
): undefined | SelectionItem[] | Step[] {
  if (!tourConfigs) return undefined;
  if (!tour) {
    // temporarily remove all coming soon tours from drawer
    const nonHiddenTours = tourConfigs.filter((tc) => tc.coming_soon != true);
    return nonHiddenTours.map((tour, index) => {
      const { coming_soon, id, ...rest } = tour;

      return {
        ...rest,
        id,
        itemId: index.toString(),
        comingSoon: !!coming_soon,
        ...(!tour.coming_soon ? { onTourSelect: () => onTourSelect(id) } : {}),
      };
    }) as SelectionItem[];
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
  }) as Step[];
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
  setNavState({
    step: isToggle ? -1 : selectedStepIndex,
    subStep: isToggle ? -1 : 0,
  });
}

const emptyEngineData = {
  targetState: {},
  animation: [],
  prevTargetState: {},
};

export function getCurrentEngineData(
  tour: string,
  tourConfigs: Definition[] | null,
  step: number,
  subStep: number
): {
  targetState: Player;
  animation: AnyFrame[];
  prevTargetState: Player;
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

  let prevTargetState: Player = emptyEngineData.prevTargetState;

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
