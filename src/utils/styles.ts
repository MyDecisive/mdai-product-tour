import { createTheme } from "@mui/material/styles";

import type {} from "@mui/x-tree-view/themeAugmentation";

export const theme = createTheme({
  palette: {
    mode: "dark",
    divider: "rgba(111, 111, 111, 0.50)",
    text: {
      primary: "#D9D9D9",
      secondary: "#EDEDED",
    },
    background: {
      default: "#212121",
      paper: "#393939",
    },
    primary: {
      main: "#B062C2",
      contrastText: "#000000",
    },
    secondary: {
      main: "#6F6F6F",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#B00020",
      contrastText: "#FFFFFF",
    },
    // Docs label this as colors related to buttons: https://mui.com/material-ui/customization/dark-mode/
    // action: {
    //   active: "",
    //   hover: "",
    //   selected: "",
    //   disabled: "",
    //   disabledBackground: "",
    // }
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: "small",
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: "4px",
          fontWeight: 700,
        },
        sizeMedium: {
          borderRadius: "12px",
          padding: "12px 36px",
        },
        contained: {
          color: "#FFFFFF",
        },
        outlined: {
          borderWidth: "2px",
        },
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        root: {
          padding: 0,
        },
        content: {
          padding: "10px 4px 10px 8px",
        },
        groupTransition: {
          marginLeft: "16px",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: "24px",
          height: "84px",
          boxSizing: "border-box",
          ["@media (min-width: 600px)"]: {
            minHeight: "initial",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          padding: "20px 28px 20px 18px",
          maxWidth: "unset",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3A3A3A",
          position: "relative",
          "& svg": {
            backgroundColor: "#1E1E1E",
            boxShadow:
              "inset 4px 4px 0 0 #333333ff, inset -4px -4px 0 0 #333333ff", // Blend of #background color + shadow effects
          },
          "&:hover svg": {
            // TODO: This is _slightly_ too dark, but maybe no one will notice?
            boxShadow: "inset 4px 4px 0 0 #3E3542, inset -4px -4px 0 0 #3E3542", // Blend of #333333 + hover tint
          },
        },
      },
    },
  },
});
