import { CURSOR_CHAR, TERMINAL_PROMPT } from "../../../utils/constants";
import type { TerminalTypedOptions } from "../../../utils/types";

const userEntryBehavior: Partial<TerminalTypedOptions> = {
  prompt: TERMINAL_PROMPT,
  typeSpeed: 70,
  backSpeed: 150,
  cursorChar: CURSOR_CHAR,
  showCursor: true,
  contentType: "html",
};

// NOTE: For good terminal simulation, the `strings` array for this one should only have a single line in it. Just repeat for as many lines as the terminal is supposed to be executing.
const terminalExecutionBehavior: Partial<TerminalTypedOptions> = {
  startDelay: 500,
  typeSpeed: 5,
  cursorChar: CURSOR_CHAR,
  showCursor: true,
  contentType: "html",
};

export function createTerminalContent(
  strings: string[],
  behavior?: string
): TerminalTypedOptions[] {
  if (behavior === "terminal") {
    return [
      {
        ...terminalExecutionBehavior,
        strings: ["<br/>"],
      },
    ].concat(
      strings.map((string) => ({
        ...terminalExecutionBehavior,
        strings: [string],
      }))
    );
  }

  return [
    {
      ...userEntryBehavior,
      strings: strings.map(
        (str) => `\`${userEntryBehavior.prompt}\` ^850${str}`
      ),
    },
  ];
}
