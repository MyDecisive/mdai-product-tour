import type { SimScript } from "../../utils/types";
import { ITEM_IDS } from "../common";
import otelSample from "../Logs/configSamples/otelSample.yaml?raw";
import mdaiHubSample from "../Logs/configSamples/mdaiHubSample.yaml?raw";

export const LOGS_SIMS: Record<string, SimScript> = {
  [ITEM_IDS.step1_visualize]: [
    {
      simType: "config.show",
      configFile: otelSample,
      configName: "otel-collector.yaml",
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
      range: { start: 73, end: 79 },
    },
    { simType: "status.set", text: "Collector configured…", delay: 300 },
    {
      simType: "terminal.run",
      cmd: "kubectl get pods -n observability",
      delay: 300,
    },
    {
      simType: "terminal.out",
      text: "collector-abc123   Running\nloki-0   Running\npromtail-xyz   Ready",
      delay: 250,
    },
    {
      simType: "logs.append",
      lines: ["… received 125 spans", "… exporting to mdai-hub"],
      delay: 300,
    },
  ],
  [ITEM_IDS.step2_configure]: [
    {
      simType: "config.show",
      configFile: mdaiHubSample,
      configName: "mdai-hub.yaml",
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/mdai/hub/hub_ref.yaml",
      range: { start: 80, end: 92 },
    },
    {
      simType: "terminal.run",
      cmd: "mdai hub apply -f config.yaml",
      delay: 250,
    },
    { simType: "terminal.out", text: "Applied. Version: 1.2.3", delay: 200 },
    {
      simType: "status.set",
      text: ["Hub connected", "PII scrubber active", "Replay disabled"],
      delay: 250,
    },
    {
      simType: "logs.append",
      lines: ["policy: pii.scrub enabled", "sink: mdai-cloud up"],
      delay: 250,
    },
  ],
};