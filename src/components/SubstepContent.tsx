import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";

const SubstepStyles = css({
  borderRadius: "4px",
  padding: "8px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const SubstepTitleStyles = css({
  fontWeight: 700,
});

const SubstepBodyStyles = css({});

type SubstepProps = {
  children: ReactNode;
  title?: ReactNode;
};

export function SubstepContent({ children, title }: SubstepProps) {
  return (
    <Box sx={SubstepStyles}>
      {title && (
        <Typography component="span" sx={SubstepTitleStyles}>
          {title}
        </Typography>
      )}
      <Typography component="span" sx={SubstepBodyStyles}>
        {children}
      </Typography>
    </Box>
  );
}
