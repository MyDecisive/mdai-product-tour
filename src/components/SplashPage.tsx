import { Grid, Stack, Typography } from "@mui/material";

const splashData = {
  header: {
    title: {
      text: "Stop Paying the Observability Tax.",
    },
    body: `Welcome to a smarter, OTel-native way to manage your telemetry — with zero vendor lock-in. Step into our interactive workspace and see the platform in action.`,
  },
  card: {
    title: "The MyDecisive Difference",
    sections: [
      {
        title: "Unify Your Context",
        body: `Stop toggling between silos. SmartHub braids infrastructure logs + traces together, for every error with zero orphaned spans.`,
      },
      {
        title: "Your Environment, Your Rules",
        body: `Run directly in your K8s cluster (BYOC). SmartHub brings stateful stream processing local to your apps and edge.`,
      },
      {
        title: "OTel in Minutes. Unlock vendors",
        body: `With SmartHub, route data from any source agent to destination vendor or cut out vendors where you don’t want them.`,
      },
    ],
  },
  card2: {
    title: "What You'll Experience",
    body: "In this demo, you will step into the role of a Platform Engineer using MyDecisive to reclaim their budget and sanity:",
  },
  bottomSection: {
    title: "Stop Observing. Start Deciding.",
    body: "Step into our interactive demo to see how MyDecisive empowers platform engineers to intercept telemetry directly on the wire and instantly filter out 90% of redundant noise. ",
  },
};

export function SplashPage() {
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
          <Typography mb={2} variant="body1">
            {splashData.bottomSection.body}
          </Typography>
          <Typography textAlign="left" variant="h5">
            {splashData.bottomSection.title}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
