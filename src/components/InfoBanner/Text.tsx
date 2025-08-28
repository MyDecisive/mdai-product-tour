import { Typography } from "@mui/material";

export const textComponent = (label: string, number: string) => {
    return (
      <>
        <Typography
          variant="overline"
          component="div"
          sx={{ pl: 1, pr: 0 }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ p: 0 }}>
          {number}
        </Typography>
      </>
    )
  }