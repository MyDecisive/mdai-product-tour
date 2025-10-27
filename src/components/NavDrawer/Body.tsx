import { useState } from "react";
import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "../TreeItem";
import type {
  DrawerConfig,
  Step,
  SubStep,
  Tour,
} from "../../utils/drawerTypes";
import { SubStep as SubStepTreeItem } from "./Steps/SubStep";
import { InfoBox } from "../InfoBox";

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

type BodyProps = {
  inTour?: boolean;
  drawerItems?: DrawerConfig;
  expandedDrawerItems?: string[];
};

export function Body({ inTour, drawerItems, expandedDrawerItems }: BodyProps) {
  const [isTour, setIsTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<Tour | null>(null);
  console.log(drawerItems, isTour, tourSteps);

  function handleDrawerItemSelect(item: Tour) {
    setTourSteps(item);
    setIsTour(true);
  }

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
        >
          {!isTour
            ? drawerItems?.tours.map(
                ({
                  id,
                  title,
                  subtitle,
                  steps,
                  coming_soon,
                  buttonText,
                }: Tour) => (
                  <TreeItem
                    key={id}
                    topLevel
                    itemId={id}
                    label={title}
                    slotProps={{
                      label: {
                        style: { textTransform: "uppercase" },
                        ...(coming_soon ? { subLabel: subtitle } : {}),
                      },
                    }}
                  >
                    {!coming_soon && (
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
                              <Button
                                size="medium"
                                onClick={() =>
                                  handleDrawerItemSelect({
                                    id,
                                    title,
                                    subtitle,
                                    steps,
                                    coming_soon,
                                    buttonText,
                                  })
                                }
                              >
                                {buttonText}
                              </Button>
                            </div>
                          </>
                        )}
                      </InfoBox>
                    )}
                  </TreeItem>
                )
              )
            : tourSteps &&
              tourSteps?.steps?.map(({ id, title, substeps }: Step) => (
                <TreeItem key={id} topLevel itemId={id} label={title}>
                  {substeps
                    ? substeps?.map(
                        ({
                          id,
                          title,
                          content,
                          visualizationModal,
                        }: SubStep) => (
                          <SubStepTreeItem
                            id={id}
                            title={title}
                            content={content}
                            visualizationModal={visualizationModal}
                          />
                        )
                      )
                    : null}
                </TreeItem>
              ))}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
