import { TreeItem } from "../components";
import { DLF, DTF, PII } from "../constants";
import { DynamicLogFiltrationContent } from "../views/Home/content";
import { getViewTitle } from "./strings";

export function HomeViewContent() {
  return [
    {
      itemId: DLF,
      label: getViewTitle(DLF),
      content: <DynamicLogFiltrationContent />,
    },
    {
      itemId: DTF,
      label: getViewTitle(DTF),
      subLabel: "Coming soon",
      content: "",
    },
    {
      itemId: PII,
      label: getViewTitle(PII),
      subLabel: "Coming soon",
      content: "",
    },
  ].map(({ itemId, label, content, subLabel }) => (
    <TreeItem
      key={itemId}
      topLevel
      itemId={itemId}
      label={label}
      slotProps={{
        label: {
          style: { textTransform: "uppercase" },
          // @ts-expect-error: Custom subLabel prop not in MUI types
          subLabel,
        },
      }}
    >
      {content}
    </TreeItem>
  ));
}
