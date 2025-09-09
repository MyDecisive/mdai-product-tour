import type { View } from "./types";

export const Logs: View = "Logs";
export const Traces: View = "Traces";
export const PII: View = "PII";
export const Home: View = "Home";

export const contactUrl = `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`;
export const contactAPIEndpoint = import.meta.env.VITE_CONTACT_API_URL;