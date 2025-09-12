import { useContext } from "react";
import { HighlanderContext } from "../contexts/highlander";

export function useHighlander() {
  const context = useContext(HighlanderContext);

  if (context === undefined) {
    throw new Error("useHighlander must be used with HighlanderProvider");
  }

  return context;
}
