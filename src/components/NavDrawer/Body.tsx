import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { useGetDrawerContent } from "../../hooks/useGetDrawerContent";
import { TreeItem } from "../TreeItem";
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

export function Body() {
  const { drawerItems, handleDrawerItemClick, expandedDrawerItems } =
    useGetDrawerContent();

  return (
    <Box sx={css([BodyScrollContainer])}>
      <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
          expandedItems={expandedDrawerItems}
          onItemClick={handleDrawerItemClick}
        >
          {drawerItems.map(
            ({ itemId, label, content, slotProps, subSteps }) => (
              <TreeItem
                key={itemId}
                topLevel
                itemId={itemId}
                label={label}
                slotProps={slotProps}
              >
                {subSteps
                  ? subSteps.map(
                      ({
                        itemId: id,
                        label: subStepLabel,
                        content: subStepContent,
                      }) => (
                        <TreeItem
                          key={id}
                          sx={NavTreeSubStepStyles}
                          itemId={id}
                          label={subStepLabel}
                        >
                          {subStepContent}
                          <StepNavButtons />
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
