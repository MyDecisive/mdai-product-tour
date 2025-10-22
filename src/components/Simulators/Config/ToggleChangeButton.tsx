import { IconButton } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export function ToggleChangeButton({
  showingChange,
  onClick,
}: {
  showingChange: boolean;
  onClick: () => void;
}) {
  const [clicked, setClicked] = useState<boolean>(false);

  useEffect(() => {
    setClicked(false);
  }, [showingChange]);

  const handleClick = useCallback(() => {
    onClick();
    setClicked(true);
  }, [onClick]);

  return (
    <IconButton
      size="small"
      onClick={handleClick}
      sx={{
        width: 20,
        height: 20,
        position: "absolute",
        left: 0,
        top: 0,
      }}
      loading={clicked}
    >
      {showingChange ? "⟲" : "↻"}
    </IconButton>
  );
}
