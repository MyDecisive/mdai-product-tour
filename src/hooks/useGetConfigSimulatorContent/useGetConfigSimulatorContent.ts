import { useMemo } from "react";
import type { EngineTargetState } from "../../types/player";
import { useManageScrollTo } from "./useManageScrollTo";

export function useGetConfigSimulatorContent({
  files,
  activeScrollTarget,
  onConfigScrollComplete,
}: NonNullable<EngineTargetState["config"]> & {
  onSetActiveTab: (tabName: string) => void;
  onConfigScrollComplete: (scrollId: string) => void;
}) {
  const { makeSetContainerRef } = useManageScrollTo({
    activeScrollTarget,
    onConfigScrollComplete,
  });

  const tabContents = useMemo(() => {
    return Object.values(files).map((file) => ({
      ...file,
      makeSetContainerRef,
    }));
  }, [files, makeSetContainerRef]);

  return {
    tabContents,
  };
}
