import { selectPanelState } from "../contexts/selectors";
import { useSelector } from "./useSelector";

export function useGetLogsSimulatorContent() {
  const { logs } = useSelector(selectPanelState);

  return logs;
}
