import { useContext } from "react";
import { NavigationContext } from "../contexts/navigation";

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  const { navigation, setNavigation } = context;

  return {
    ...navigation,
    setNavigation,
  };
}
