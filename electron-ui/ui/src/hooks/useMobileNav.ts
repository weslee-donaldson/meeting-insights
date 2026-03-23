import { createContext, useContext } from "react";

interface MobileNavContextValue {
  goToDetail: () => void;
  goToChat: () => void;
  goToList: () => void;
  isMobile: boolean;
}

const defaultValue: MobileNavContextValue = {
  goToDetail: () => {},
  goToChat: () => {},
  goToList: () => {},
  isMobile: false,
};

export const MobileNavContext = createContext<MobileNavContextValue>(defaultValue);

export function useMobileNav(): MobileNavContextValue {
  return useContext(MobileNavContext);
}
