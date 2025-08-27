import { Typography } from "@mui/material";

export const textComponent = (label: string, number: string) => {
    return (
      <>
        <Typography
          variant="overline"
          component="div"
        >
          {label}
        </Typography>
        <Typography variant="h6">
          {number}
        </Typography>
      </>
    )
  }