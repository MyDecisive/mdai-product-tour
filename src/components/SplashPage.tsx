import { Grid, Link, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDemoContext } from "../hooks/useDemoContext";

const splashData = {
  header: {
    title: {
      text: "Welcome! Step through our interactive demos in a familiar workspace.",
    },
    body: `Stop paying the "Observability Tax." Welcome to a smarter, OTel-native way to manage your telemetry without vendor lock-in.”`,
  },
  card: {
    title: "The MyDecisive Difference",
    sections: [
      {
        title: "Unify Your Context",
        body: `Stop toggling between silos. We "braid" Logs, Metrics, and Traces into a single, unbreakable relationship so you always have the "why" behind every alert. We don't just link data; we maintain the stateful relationship between containers, instances, and trace spans. No more orphaned logs.`,
      },
      {
        title: "Your Environment, Your Rules",
        body: `By running in your K8s cluster (BYOC), we execute complex transformations and PII redaction in real-time, reducing latency and egress costs. Keep your data behind your perimeter while unlocking in-memory processing power that SaaS vendors can't match.`,
      },
      {
        title: "OpenTelemetry in minutes. Zero Lock-in",
        body: `No proprietary hooks. Our hub acts as a high-performance proxy and filter, giving you the freedom to swap backends with a single config change. Filter and route data to any backend - Datadog, Splunk - without being held hostage by proprietary agents.`,
      },
    ],
  },
  card2: {
    title: "What You'll Experience",
    body: "In this demo, you will step into the role of a Platform Engineer using MyDecisive to reclaim their budget and sanity:",
    sections: [
      {
        title: "Intercept Data on the Wire",
        body: `Experience real-time "on-the-wire" inspection. See how the stream understands log structures at the source.`,
      },
      {
        title: "Cut Costs Instantly",
        body: `Watch us filter out 90% of redundant noise while keeping the signals your SREs need. See your projected SaaS spend drop as signal-to-noise ratio climbs.`,
      },
      {
        title: "Take Control of your Data",
        body: `Identify, anonymize, or delete sensitive user data in-flight before it ever leaves your network to ensure total GDPR and HIPAA compliance by redacting PII while the data is still in your control.`,
      },
    ],
  },
  bottomSection: {
    title: "What You'll Experience",
    body: "In this demo, you will step into the role of a Platform Engineer using MyDecisive to reclaim their budget and sanity:",
    bullets: [
      <span>
        {`See how our `}
        <Link
          href="https://www.mydecisive.ai/solutions/intelligent-logstream"
          target="_blank"
          rel="noopener noreferrer"
        >
          Intelligent LogStream
        </Link>
        {` changes the paradigm by moving intelligence to the "edge" of your data pipeline. It doesn't just transport logs; it understands them in real-time, on the wire.`}
      </span>,
      `Watch it identify noisy, redundant services and apply filters that reduce volume by 90% or more while keeping the signals that matter.`,
    ],
    footer: {
      title: "Navigating the Demo",
      body: "For a quick guide on how to move through the interactive SmartHub",
      link: {
        href: "",
        text: " go here.",
      },
    },
  },
};

export function SplashPage() {
  const { setNavState } = useDemoContext();

  const startTour = useCallback(
    (tour: string = "logs") => {
      setNavState({
        tour: tour,
        step: 0,
        subStep: 0,
      });
    },
    [setNavState]
  );
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
          <Typography mb={4} textAlign="left" variant="h5">
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
                  <Typography variant="body2">{section.body}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>

        {/* BOTTOM SECTION */}
        <Stack>
          <Typography mb={2} textAlign="left" variant="h5">
            {splashData.bottomSection.title}
          </Typography>
          <Typography variant="body1">
            {splashData.bottomSection.body}
          </Typography>
          <ul>
            {splashData.card2.sections.map((sect, idx) => {
              return (
                <li key={`bottomSection-sect-${idx}`}>
                  <Typography variant="body2">
                    <b>{sect.title}: </b>{sect.body}
                  </Typography>
                </li>
              );
            })}
          </ul>

          {/* FOOTER */}
          <Typography variant="body1" mt={2}>
            <b>{splashData.bottomSection.footer.title}: </b>{splashData.bottomSection.footer.body}
            <Link
              onClick={() => startTour("intro")}
              sx={{
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
