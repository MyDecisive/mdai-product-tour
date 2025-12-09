import { useMemo } from "react";
import type { EngineConfigTarget } from "../../utils/engineTypesScratch";
import { useManageScrollTo } from "./useManageScrollTo";

export function useGetConfigSimulatorContent({
  files,
  activeScrollTarget,
  onConfigScrollComplete,
}: EngineConfigTarget & {
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
