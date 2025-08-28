import { Typography } from "@mui/material";

type infoBannerTextProps = {
  title: string;
  description: string;
  styles?: object;
};

export function textComponent ({title, description, styles}: infoBannerTextProps) {
    return (
      <>
        <Typography
          variant="overline"
          component="div"
          sx={{ ...styles }}
        >
          {title}
        </Typography>
        <Typography variant="h6" sx={{ p: 0 }}>
          {description}
        </Typography>
      </>
    )
  }