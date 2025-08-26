import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import { Fragment, type ReactNode } from "react";

const SubstepStyles = css({
  borderRadius: "4px",
  padding: "16px",
  fontWeight: 400,
});

const SubstepTitleStyles = css({
  padding: "6px 12px",
  fontWeight: 500,
});

type SubstepProps = {
  children: ReactNode;
  title?: ReactNode;
};

export function SubstepContent({ children, title }: SubstepProps) {
  return (
    <Fragment>
      {title && (
        <Box sx={css([SubstepStyles, SubstepTitleStyles])}>{title}</Box>
      )}
      <Box sx={css([SubstepStyles])}>{children}</Box>
    </Fragment>
  );
}
