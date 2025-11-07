import { createTheme } from "@mui/material/styles";

import type {} from "@mui/x-tree-view/themeAugmentation";

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1001,
      xl: 1536,
    },
  },
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
      main: "#8E24AA",
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
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "var(--purple-A100)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "var(--purple-A100)",
          textTransform: "uppercase",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "28px",
          "&&.Mui-selected": {
            color: "var(--purple-A100)",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        barColorSecondary: {
          backgroundColor: "#EDEDED",
        },
        barColorPrimary: {
          backgroundColor: "#B062C2",
        },
        root: {
          width: "100%",
          p: 0,
          borderRadius: "4px",
          background: "transparent",
        },
      },
    },
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
