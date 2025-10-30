import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "../TreeItem";
import type { Step, SubStep } from "../../utils/drawerTypes";
import { SubStep as SubStepTreeItem } from "./Steps/SubStep";
import { InfoBox } from "../InfoBox";
import { useDemoContext } from "../../hooks/useDemoContext";

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
});

export const subLabelStyles = css({
  color: "#8A38F5",
  fontStyle: "italic",
  fontFamily: "Inter",
});

const BodyScrollContainer = css({
  maxHeight: `100%`,
  overflowY: "auto",
  overflowX: "hidden",
});

type DrawerItemsProps = {
  id: string;
  title: string;
  subtitle?: string;
  substeps?: Step[] | SubStep[];
  coming_soon?: boolean;
  buttonText?: string;
  onTourSelect?: () => void;
};

export function Body() {
  const DemoContext = useDemoContext();

  const isTour = DemoContext.navigationState.tour !== "";

  return (
    <Box sx={css([BodyScrollContainer])}>
      {!isTour && (
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
          expandedItems={DemoContext.expandedDrawerItems}
          onItemClick={DemoContext.handleTreeItemClick}
        >
          {DemoContext.drawerItems &&
            DemoContext.drawerItems?.map(
              (
                {
                  id,
                  title,
                  subtitle,
                  substeps,
                  coming_soon,
                  buttonText,
                  onTourSelect,
                }: DrawerItemsProps,
                index: number
              ) => (
                <TreeItem
                  key={id}
                  topLevel
                  itemId={`${index}`}
                  label={title}
                  slotProps={{
                    label: {
                      style: { textTransform: "uppercase" },
                      ...(coming_soon ? { subLabel: subtitle } : {}),
                    },
                  }}
                >
                  {!coming_soon && onTourSelect && (
                    <InfoBox>
                      {subtitle && <Typography>{subtitle}</Typography>}
                      {buttonText && (
                        <>
                          <br />
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              justifyContent: "center",
                            }}
                          >
                            <Button size="medium" onClick={onTourSelect}>
                              {buttonText}
                            </Button>
                          </div>
                        </>
                      )}
                    </InfoBox>
                  )}
                  {substeps
                    ? substeps?.map(
                        (
                          { title, content, visualizationModal }: SubStep,
                          idx
                        ) => (
                          <SubStepTreeItem
                            id={`${index}-${idx}`}
                            title={title}
                            content={content}
                            visualizationModal={visualizationModal}
                          />
                        )
                      )
                    : null}
                </TreeItem>
              )
            )}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
