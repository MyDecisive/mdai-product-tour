import { Box, Link, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import GitHubIcon from "../../assets/logos/github-icon.svg";
import LinkedInIcon from "../../assets/logos/linkedIn-icon.png";
import SlackIcon from "../../assets/logos/logo_slack.svg";
import LogoText from "../../assets/logos/mydecisive-ai-logo-text.svg";
import Logo from "../../assets/logos/smol-logo.svg";
import { useDemoContext } from "../../hooks/useDemoContext";

const linkStyles = {
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
};

export const Footer = () => {
  const { setContactModalOpen } = useDemoContext();

  const openContactModal = useCallback(() => {
    setContactModalOpen(true);
  }, [setContactModalOpen]);

  return (
    <Box
      component={"footer"}
      sx={{
        display: "flex",
        flexDirection: { xs: "column" },
        maxHeight: { xs: "500px", md: "325px" },
        width: "100%",
        zIndex: 1300,
        rowGap: { xs: 0, sm: "40px" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        borderTop: "1px solid #6F6F6F",
        bgcolor: "#393939",
        pt: { xs: 0, sm: "16px" },
        pr: { sm: "20px" },
        pb: { xs: "8px", sm: "16px" },
        position: "relative",
      }}
    >
      <Stack
        width={"95%"}
        direction={{ xs: "column", sm: "row" }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
        rowGap={{ xs: "48px", sm: "10px" }}
        px={"12px"}
      >
        <Stack
          direction={{ xs: "column", md: "column" }}
          justifyContent={"flex-start"}
          order={{ xs: 99, sm: 0 }}
        >
          <Link
            href={"https://www.mydecisive.ai/"}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Stack
              direction={"row"}
              columnGap={"6px"}
              paddingRight={{ xs: "20px", md: "0" }}
            >
              <Box
                component={"img"}
                src={Logo}
                sx={{ width: "33px", height: "33px" }}
              />
              <Box
                component="img"
                src={LogoText}
                sx={{ color: "red" }}
                alt={"logo"}
              />
            </Stack>
          </Link>
        </Stack>
        <Stack
          order={{ xs: 0, sm: 2 }}
          direction={{ xs: "column", sm: "row" }}
          width={{ xs: "100%", sm: "60%", md: "50%" }}
          justifyContent={"space-between"}
          alignItems={"center"}
          rowGap="20px"
          mb="4px"
        >
          <Link sx={linkStyles} onClick={openContactModal}>
            Need Help?
          </Link>
          <Link
            href="https://docs.mydecisive.ai/"
            sx={linkStyles}
            rel="noopener noreferrer"
            target="_blank"
          >
            Docs
          </Link>
          <Link
            href="https://www.mydecisive.ai/solutions"
            sx={linkStyles}
            rel="noopener noreferrer"
            target="_blank"
          >
            Solutions
          </Link>
        </Stack>
        <Stack
          order={{ xs: 1, sm: 99 }}
          alignItems={"flex-end"}
          position={"relative"}
        >
          <Stack
            direction={"row"}
            columnGap={{ xs: "8px", sm: "16px", md: "24px" }}
          >
            <Link
              href="https://mydecisivecommunity.slack.com/archives/C08LJ9Z8EBE"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Box
                alt="Slack"
                component={"img"}
                src={SlackIcon}
                width={"45px"}
              />
            </Link>
            <Link
              href="https://github.com/orgs/MyDecisive/repositories?type=public"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Box
                alt="GitHub"
                component={"img"}
                src={GitHubIcon}
                width={"45px"}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/company/mydecisiveai/?viewAsMember=true"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Box
                alt="LinkedIn"
                component={"img"}
                src={LinkedInIcon}
                width={"51px"}
              />
            </Link>
          </Stack>
          <Typography
            sx={{ fontSize: "12px", position: "absolute", bottom: "-1em" }}
          >
            &copy; 2025 DecisiveAI, Inc.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
