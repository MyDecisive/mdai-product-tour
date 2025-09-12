import type { Service } from "../../utils/types";

/** step 1 */
export const startingServices: Service[] = [
  {
    name: "prometheus-kube-prometheus-stack-prometheus-0",
    noSuffix: true,
    skipStartup: true,
  },
  { name: "opentelemetry-operator-6d8ddbdc4d", skipStartup: true },
  { name: "mdaihub-sample-observer-collector-6ccb6ffd94", skipStartup: true },
  { name: "mdai-valkey-primary-0", noSuffix: true, skipStartup: true },
  { name: "mdai-rabbitmq-0", noSuffix: true, skipStartup: true },
  { name: "mdai-prometheus-node-exporter-ntxbv", skipStartup: true },
  { name: "mdai-operator-controller-manager-65955fb98b", skipStartup: true },
  { name: "mdai-kube-state-metrics-6cd9fd8458", skipStartup: true },
  { name: "mdai-grafana-84bb594f6c", skipStartup: true },
  { name: "mdai-gateway-5df8b6f749", skipStartup: true },
  { name: "mdai-event-hub-556c8897f5", skipStartup: true },
  { name: "kube-prometheus-stack-operator-6cfdc788d4", skipStartup: true },
  {
    name: "alertmanager-kube-prometheus-stack-alertmanager-0",
    noSuffix: true,
    skipStartup: true,
  },
];

export const logGenServices: Service[] = [
  { name: "mdai-logger-xnoisy-6f986cf574", replicas: 3 },
  { name: "mdai-logger-noisy-5d4cc79cf8", replicas: 3 },
  { name: "mdai-logger-68b7cc7f48", replicas: 3 },
];

export const fluentDServices: Service[] = [
  {
    name: "fluent-fluentd",
  },
];

/** step 2 */

export const step2StartingSvcs: Service[] = [
  {
    name: "gateway-collector",
    replicas: 5,
    skipStartup: true,
  },
];

export const step2UpdateSvcs: Service[] = [
  {
    name: "gateway-collector",
    replicas: 5,
  },
];
