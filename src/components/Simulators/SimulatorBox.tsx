import { Box, Link, Typography } from "@mui/material";

interface SimulatorBoxProps {
  title: string;
  link?: string;
  href?: string;
  styles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
  children?: React.ReactNode;
  active?: boolean;
}

export function SimulatorBox({
  title,
  link,
  href,
  children,
  styles,
  innerStyles,
  active,
}: SimulatorBoxProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...styles,
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        {link && href && (
          <Link
            href={href}
            variant="body2"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            {link}
          </Link>
        )}
      </Box>
      <Box
        className={`actual-simulator-container ${title
          .toLowerCase()
          .replace(" ", "-")}`}
        sx={[
          {
            p: "24px 16px 16px 16px",
            minHeight: "350px",
            maxWidth: "100%",
            borderRadius: "4px",
            background: "#393939",
            position: "relative",
            border: `3px solid ${active ? "#EA80FC" : "#393939"}`,
          },
          active && !children
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }
            : {
                ...innerStyles,
              },
        ]}
      >
        {active && !children ? (
          <Typography variant="h4" sx={{ color: "#EA80FC" }}>
            {`${title} Simulator`}
          </Typography>
        ) : (
          children
        )}
      </Box>
    </>
  );
}
