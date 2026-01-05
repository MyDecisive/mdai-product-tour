import { Grid, Link, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDemoContext } from "../hooks/useDemoContext";

const splashData = {
  header: {
    // title: `Welcome to the interactive preview of th <a href="https://www.mydecisive.ai/platform">MyDecisive SmartHub</a>`,
    title: {
      text: "Welcome to the interactive preview of the ",
      link: {
        text: "MyDecisive SmartHub",
        href: "https://www.mydecisive.ai/platform",
      }
    },
    body: `In an era where "more data" often means "more noise" and skyrocketing costs, MyDecisive provides a different path. We believe platform teams should be innovating, not fighting fires.`,
  },
  card: {
    title: "The MyDecisive Difference",
    sections: [
      {
        title: "Braided Context (Logs + Traces + Metrics)",
        body: `MyDecisive understands the relationships between your telemetry. We keep all related logs and metrics from the specific containers and instances that serve your trace spans, ensuring you never lose the "why" behind an event.`,
      },
      {
        title: "Bring Your Own Cloud (BYOC)",
        body: `MyDecisive runs in your environment on Kubernetes. This keeps your data secure, ensures compliance, and allows for sophisticated in-memory processing that SaaS-based vendors simply cannot provide.`
      },
      {
        title: "Zero Vendor Lock-in",
        body: `We are 100% Open Source and built on OpenTelemetry (OTel) standards. Use our hub to filter and proxy data to Splunk, Datadog, or Databricks without being tethered to proprietary agents or APIs.`
      },
    ],
  },
  bottomSection: {
    title: "What You'll Experience",
    body: "In this demo, you will step into the role of a Platform Engineer using MyDecisive to reclaim their budget and sanity:",
    bullets: [
      <span>
        {`See how our `}
        <a
          href="https://www.mydecisive.ai/solutions/intelligent-logstream"
          target="_blank"
          rel="noopener noreferrer"
        >
          Intelligent LogStream
        </a>
        {` changes the paradigm by moving intelligence to the "edge" of your data pipeline. It doesn't just transport logs; it understands them in real-time, on the wire.`}
      </span>,
      `Watch it identify noisy, redundant services and apply filters that reduce volume by 90% or more while keeping the signals that matter.`,
    ],
    footer: {
      text: "For info on navigating the preloaded interactive demo, ",
      link: {
        href: "",
        text: "go here.",
      },
    },
  },
};

export function SplashPage() {
  const { setNavState } = useDemoContext();

  const startTour = useCallback((tour: string = "logs") => {
    setNavState({
      tour: tour,
      step: 0,
      subStep: 0,
    });
  }, [setNavState]);
  return (
    <Stack
      alignItems="flex-start"
      minHeight={"calc(100% - 325px)"}
      pb={{ sm: 1, lg: 7 }}
      pt={{ sm: 1, lg: 7 }}
      pl={{ sm: 1, lg: 9 }}
      pr={{ sm: 1, lg: 11 }}
      overflow="auto"
    >
      <Stack
        gap={4}
        minWidth={{ sm: "320px", mx: "700px", lg: "800px" }}
        textAlign="left"
      >
        {/* Header */}
        <Typography variant="h3" fontSize="32px">
          {splashData.header.title.text}
          <a
            href={splashData.header.title.link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {splashData.header.title.link.text}
          </a>
          {"."}
        </Typography>
        <Typography variant="body1" maxWidth={700}>
          {splashData.header.body}
        </Typography>

        {/* Card */}
        <Stack
          sx={{
            backgroundColor: "#383838",
            border: "1px solid #8E24AA",
            borderRadius: "8px",
            minHeight: 220,
            textAlign: "center",
            px: 5,
            py: 5,
          }}
        >
          <Typography
            mb={4}
            textAlign="left"
            variant="h5"
          >
            {splashData.card.title}
          </Typography>

          <Grid container spacing={4} alignItems="flex-start">
            {splashData.card.sections.map((section, idx: number) => (
              <Grid
                key={`card-section-${idx}`}
                size={{ sm: 12, lg: 4 }}
                textAlign="left"
              >
                <Stack>
                  <Typography variant="body2" fontWeight={700} mb={2}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2">
                    {section.body}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>

        {/* BOTTOM SECTION */}
        <Stack>
          <Typography
            mb={2}
            textAlign="left"
            variant="h5"
          >
            {splashData.bottomSection.title}
          </Typography>
          <Typography variant="body1">
            {splashData.bottomSection.body}
          </Typography>
          <ul>
            {splashData.bottomSection.bullets.map((bullet, idx) => {
              return (
                <li key={`bottomSection-bullet-${idx}`}>
                  <Typography variant="body2">
                    {bullet}
                  </Typography>
                </li>
              );
            })}
          </ul>

          {/* FOOTER */}
          <Typography variant="body1" mt={2}>
            {splashData.bottomSection.footer.text}
            <Link
              onClick={() => startTour("intro")}
              sx={{
                color: "#EA80FC !important",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {splashData.bottomSection.footer.link.text}
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
