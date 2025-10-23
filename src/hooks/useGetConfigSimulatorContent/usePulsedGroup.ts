import { useCallback, useEffect, useRef, useState } from "react";

export const usePulsedGroup = () => {
  const [pulsedGroups, setPulsedGroups] = useState<Set<string>>(new Set());

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const addPulsedGroup = useCallback((groupId: string) => {
    setPulsedGroups((prev) => {
      const newState = new Set(prev);

      newState.add(groupId);

      return newState;
    });

    const timeoutId = setTimeout(() => {
      setPulsedGroups((prev) => {
        const newState = new Set(prev);

        newState.delete(groupId);

        return newState;
      });
    }, 1500);
    timeoutsRef.current.push(timeoutId);
  }, []);

  return { pulsedGroups, addPulsedGroup };
};
