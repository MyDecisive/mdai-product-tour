import type { Service } from "../../utils/types";

/** step 1 */
export const startingServices: Service[] = [
  {
    namespace: "mdai",
    name: "prometheus-kube-prometheus-stack-prometheus-0",
    noSuffix: true,
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "opentelemetry-operator-6d8ddbdc4d",
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdaihub-sample-observer-collector-6ccb6ffd94",
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdai-valkey-primary-0",
    noSuffix: true,
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdai-rabbitmq-0",
    noSuffix: true,
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdai-prometheus-node-exporter-ntxbv",
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdai-operator-controller-manager-65955fb98b",
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "mdai-kube-state-metrics-6cd9fd8458",
    skipStartup: true,
  },
  { namespace: "mdai", name: "mdai-grafana-84bb594f6c", skipStartup: true },
  { namespace: "mdai", name: "mdai-gateway-5df8b6f749", skipStartup: true },
  { namespace: "mdai", name: "mdai-event-hub-556c8897f5", skipStartup: true },
  {
    namespace: "mdai",
    name: "kube-prometheus-stack-operator-6cfdc788d4",
    skipStartup: true,
  },
  {
    namespace: "mdai",
    name: "alertmanager-kube-prometheus-stack-alertmanager-0",
    noSuffix: true,
    skipStartup: true,
  },
];

export const logGenServices: Service[] = [
  { namespace: "mdai", name: "mdai-logger-xnoisy-6f986cf574", replicas: 3 },
  { namespace: "mdai", name: "mdai-logger-noisy-5d4cc79cf8", replicas: 3 },
  { namespace: "mdai", name: "mdai-logger-68b7cc7f48", replicas: 2 },
];

export const fluentDServices: Service[] = [
  {
    namespace: "default",
    name: "fluent-fluentd",
  },
];

/** step 2 */

export const step2StartingSvcs: Service[] = [
  {
    namespace: "mdai",
    name: "gateway-collector",
    replicas: 5,
    skipStartup: true,
  },
];

export const step2UpdateSvcs: Service[] = [
  {
    namespace: "mdai",
    name: "gateway-collector",
    replicas: 5,
  },
];
