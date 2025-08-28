import { Typography, Link, Box } from "@mui/material";

type SimulatorBoxProps = {
  title: string;
  link?: string;
  href?: string;
  children?: React.ReactNode;
  styles?: object;
  innerStyles?: object;
};

export function SimulatorBox({
  title,
  link,
  href,
  children,
  styles,
  innerStyles
}: SimulatorBoxProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...styles
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        <Link href={href} variant="body2" underline="hover">
          {link}
        </Link>
      </Box>
      <Box
        sx={{
          p: 1,
          minHeight: "350px",
          borderRadius: "4px",
          background: "#393939",
          ...innerStyles,
        }}
      >
        {children}
      </Box>
    </>
  );
}
