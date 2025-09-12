import type { TerminalTypedOptions } from "../../../utils/types";
import { createTerminalContent } from "./behavior";

const terminalAutoLines = [
  "<br/>",
  "<br/>",
  "^700🧪 Deploying synthetic log generators...^450",
  "deployment.apps/mdai-logger-xnoisy created",
  "deployment.apps/mdai-logger-noisy created^450",
  "deployment.apps/mdai-logger created",
  "✅ Log generators deployed",
];

const userEntry = [
  "./MDAI-kind",
  "./mdai-kind .sh",
  "./mdai-kind.sh kif",
  "./mdai-kind.sh logs",
];

export const startLogsTerminalContent: TerminalTypedOptions[] = (
  [] as TerminalTypedOptions[]
).concat(
  createTerminalContent(userEntry),
  createTerminalContent(terminalAutoLines, "terminal"),
  createTerminalContent([""])
);

const portForwardCommand = [
  "helm upgrade --install --repo https://fluent.github.io/helm-charts fluent fluentd -f ./synthetics/loggen_fluent_config.yaml",
];

const fluentDOutput = [
  "<br/>",
  `Release "fluent" does not exist. Installing it now.`,
  `NAME: fluent`,
  `LAST DEPLOYED: Thu Sep 11 10:58:12 2025`,
  `NAMESPACE: default`,
  `STATUS: deployed`,
  `REVISION: 1`,
  `NOTES:`,
  `Get Fluentd build information by running these commands:`,

  `export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=fluentd,app.`,
  `kubernetes.io/instance=fluent" -o jsonpath="{.items[0].metadata.name}")`,
  `kubectl --namespace default port-forward $POD_NAME 24231:24231`,
  `curl http://127.0.0.1:24231/metrics`,
];

export const portForwardTerminalContent: TerminalTypedOptions[] = (
  [] as TerminalTypedOptions[]
).concat(
  createTerminalContent(portForwardCommand),
  createTerminalContent(fluentDOutput, "terminal"),
  createTerminalContent([""])
);

const applyOtelConfig = ["kubectl apply -f otel/otel_ref.yaml"];

const applyConfigOutput = [
  "opentelemetrycollector.opentelemetry.io/gateway created",
];

export const applyConfigTerminalContent: TerminalTypedOptions[] = (
  [] as TerminalTypedOptions[]
).concat(
  createTerminalContent(applyOtelConfig),
  createTerminalContent(applyConfigOutput, "terminal"),
  createTerminalContent([""])
);
