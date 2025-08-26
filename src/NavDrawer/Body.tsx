import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";

import { css } from "@emotion/react";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { useMemo } from "react";
import { TreeItem } from "../components";
import { Home, Logs } from "../constants";
import { useNavigation, type NavigationState } from "../NavigationContext";
import type { View, ViewTreeItemProps } from "../types";
import { HomeViewTreeItems } from "../views/Home/drawerContent";
import { LogsViewTreeItems } from "../views/Logs/drawerContent";
import { StepNavButtons } from "./StepNavButtons";

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
});

const NavTreeSubStepStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    marginTop: "8px",
    borderLeft: `1px solid rgba(111, 111, 111, 0.50)`,
    padding: "8px 16px 0 16px",
  },
  [`& .${treeItemClasses.iconContainer} > svg`]: {
    padding: "4px",
  },
});

const HEADER_HEIGHT = 65;
const FOOTER_HEIGHT = 80;

const BodyScrollContainer = css({
  maxHeight: `calc(100% - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
  overflowY: "auto",
});

const viewItemsMap = {
  [Home]: HomeViewTreeItems,
  [Logs]: LogsViewTreeItems,
};

function getViewTreeItems(view: View) {
  return viewItemsMap[view] || [];
}

function createSubstepTreeItemId(stepId: string, substepId: string) {
  return `${stepId}-${substepId}`;
}

function deriveNextStepNavState(
  view: View,
  subSteps: Omit<ViewTreeItemProps, "subSteps">[],
  subStepIdx: number,
  steps: ViewTreeItemProps[],
  stepIdx: number
): NavigationState {
  if (subStepIdx < subSteps.length - 1) {
    const thisStepId = steps[stepIdx].itemId;
    const nextSubStepId = subSteps[subStepIdx + 1].itemId;
    return {
      view,
      step: thisStepId,
      substep: createSubstepTreeItemId(thisStepId, nextSubStepId),
    };
  }

  if (stepIdx < steps.length - 1) {
    const { itemId, subSteps } = steps[stepIdx + 1];

    return {
      view,
      step: itemId,
      ...(subSteps &&
        subSteps.length && {
          substep: createSubstepTreeItemId(itemId, subSteps[0].itemId),
        }),
    };
  }

  return {
    view: Home,
  };
}

function derivePrevStepNavState(
  view: View,
  subSteps: Omit<ViewTreeItemProps, "subSteps">[],
  subStepIdx: number,
  steps: ViewTreeItemProps[],
  stepIdx: number
): NavigationState {
  if (subStepIdx === 0) {
    if (stepIdx === 0) {
      return {
        view: Home,
      };
    }
    const { itemId, subSteps: prevStepSubsteps } = steps[stepIdx - 1];

    return {
      view,
      step: itemId,
      ...(prevStepSubsteps &&
        prevStepSubsteps.length && {
          substep: createSubstepTreeItemId(
            itemId,
            prevStepSubsteps[prevStepSubsteps.length - 1].itemId
          ),
        }),
    };
  }

  const thisStepId = steps[stepIdx].itemId;

  return {
    view,
    step: thisStepId,
    substep: createSubstepTreeItemId(
      thisStepId,
      subSteps[subStepIdx - 1].itemId
    ),
  };
}

export function Body() {
  const {
    navigation: { view, step, substep },
    updateNavigation,
    setNavigation,
  } = useNavigation();

  const treeItems = useMemo(() => {
    return getViewTreeItems(view);
  }, [view]);

  const expandedItems = [] as string[];

  if (step) {
    expandedItems.push(step);
    if (substep) {
      expandedItems.push(substep);
    }
  }

  return (
    <Box sx={css([BodyScrollContainer])}>
      <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
          expandedItems={expandedItems}
          onItemClick={(_, itemId: string) => {
            if (treeItems.find((item) => item.itemId === itemId)) {
              updateNavigation({ step: step === itemId ? undefined : itemId });
            } else {
              updateNavigation({
                substep: substep === itemId ? undefined : itemId,
              });
            }
          }}
        >
          {treeItems.map(
            ({ itemId, label, content, slotProps, subSteps }, idx) => (
              <TreeItem
                key={itemId}
                topLevel
                itemId={itemId}
                label={label}
                slotProps={slotProps}
              >
                {subSteps
                  ? subSteps.map(
                      (
                        {
                          itemId: id,
                          label: substepLabel,
                          content: substepContent,
                        },
                        index
                      ) => (
                        <TreeItem
                          key={createSubstepTreeItemId(itemId, id)}
                          sx={NavTreeSubStepStyles}
                          itemId={`${itemId}-${id}`}
                          label={substepLabel}
                        >
                          {substepContent}
                          <StepNavButtons
                            onNext={() =>
                              setNavigation(
                                deriveNextStepNavState(
                                  view,
                                  subSteps,
                                  index,
                                  treeItems,
                                  idx
                                )
                              )
                            }
                            onPrev={() =>
                              setNavigation(
                                derivePrevStepNavState(
                                  view,
                                  subSteps,
                                  index,
                                  treeItems,
                                  idx
                                )
                              )
                            }
                          />
                        </TreeItem>
                      )
                    )
                  : content}
              </TreeItem>
            )
          )}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
