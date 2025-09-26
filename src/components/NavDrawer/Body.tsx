import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Typography } from "@mui/material";
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

const BodyScrollContainer = css({
  maxHeight: `100%`,
  overflowY: "auto",
  overflowX: "hidden",
});

export function Body() {
  const { inTour, drawerItems, handleDrawerItemClick, expandedDrawerItems } =
    useGetDrawerContent();

  return (
    <Box sx={css([BodyScrollContainer])}>
      {!inTour && (
        <Box sx={{ padding: "10px 4px 10px 8px" }}>
          <Typography>
            Ready to play? Select a use case and let's roll.
          </Typography>
        </Box>
      )}
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
