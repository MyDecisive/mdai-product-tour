import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";

import { css } from "@emotion/react";
import { useMemo } from "react";
import { TreeItem } from "../components";
import { Home, Logs } from "../constants";
import { useCurrentView } from "../NavigationContext";
import type { View } from "../types";
import { HomeViewTreeItems } from "../views/Home/drawerContent";
import { LogsViewTreeItems } from "../views/Logs/drawerContent";
import { NavTreeSubStepStyles } from "./styles";

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
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

export function Body() {
  const { view } = useCurrentView();

  const treeItems = useMemo(() => {
    return getViewTreeItems(view);
  }, [view]);

  return (
    <Box sx={css([BodyScrollContainer])}>
      <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
        >
          {treeItems.map(({ itemId, label, content, slotProps, subSteps }) => (
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
                      label: substepLabel,
                      content: substepContent,
                    }) => (
                      <TreeItem
                        key={`${itemId}-${id}`}
                        sx={css([NavTreeSubStepStyles])}
                        itemId={`${itemId}-${id}`}
                        label={substepLabel}
                      >
                        {substepContent}
                      </TreeItem>
                    )
                  )
                : content}
            </TreeItem>
          ))}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
