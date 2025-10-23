import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { InfoBox } from "../../components/InfoBox";
import { useHighlander } from "../../hooks/useHighlander";
import type { ViewTreeItemProps } from "../../utils/types";
import type { Tours } from "../../utils/drawerTypes";
import drawerConfig from "../drawer-config.yaml";

function HomeTourCard({ tour, onStart }: { tour: Tours; onStart?: () => void }) {
  return (
    <InfoBox>
      {tour.subtitle && <Typography>{tour.subtitle}</Typography>}
      {tour.buttonText && onStart && (
        <>
          <br />
          <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
            <Button size="medium" onClick={onStart}>
              {tour.buttonText}
            </Button>
          </div>
        </>
      )}
    </InfoBox>
  );
}

export const viewTreeItems: ViewTreeItemProps[] = (() => {
  const { tours = [] } = (drawerConfig as { tours?: Tours[] }) || {};
  const useActions = () => {
    const { actions } = useHighlander();
    return {
      logs: actions.START_LOGS_DEMO,
    } as Record<string, (() => void) | undefined>;
  };

  const items: ViewTreeItemProps[] = tours.map((tour) => {
    const Content = () => {
      const actionMap = useActions();
      const onStart = actionMap[tour.id];
      return tour.coming_soon ? null : <HomeTourCard tour={tour} onStart={onStart} />;
    };

    return {
      itemId: tour.id,
      label: tour.title,
      content: tour.coming_soon ? null : <Content />,
      slotProps: {
        label: {
          style: { textTransform: "uppercase" },
          ...(tour.coming_soon ? { subLabel: tour.subtitle } : {}),
        },
      },
    };
  });

  return items;
})();

export const STEP_ORDER = (() =>
  toursToStepOrder((drawerConfig as { tours?: Tours[] })?.tours || []))();

function toursToStepOrder(tours: Tours[]) {
  return tours.map((t) => ({ stepId: t.id }));
}