import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface PageHeaderState {
  title: string;
  content?: ReactNode;
  action?: ReactNode;
}

interface PageHeaderContextValue {
  pageHeader: PageHeaderState | null;
  setPageHeader: Dispatch<SetStateAction<PageHeaderState | null>>;
}

export const PageHeaderContext = createContext<PageHeaderContextValue | null>(
  null,
);

export function usePageHeader() {
  const context = useContext(PageHeaderContext);

  if (!context) {
    return {
      pageHeader: null,
      setPageHeader: () => undefined,
    } satisfies PageHeaderContextValue;
  }

  return context;
}
