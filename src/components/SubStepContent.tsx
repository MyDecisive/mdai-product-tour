import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";

const SubStepStyles = css({
  borderRadius: "4px",
  padding: "8px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const SubStepTitleStyles = css({
  fontWeight: 700,
});

const SubStepBodyStyles = css({});

type SubStepProps = {
  children: ReactNode;
  title?: ReactNode;
};

export function SubStepContent({ children, title }: SubStepProps) {
  return (
    <Box sx={SubStepStyles}>
      {title && (
        <Typography component="span" sx={SubStepTitleStyles}>
          {title}
        </Typography>
      )}
      <Typography component="span" sx={SubStepBodyStyles}>
        {children}
      </Typography>
    </Box>
  );
}
