import { useEffect } from "react";
import { usePageHeader } from "@/common/components/page-header-context";

interface PageHeaderProps {
  title: string;
  description?: string;
  content?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, content, action }: PageHeaderProps) {
  const { setPageHeader } = usePageHeader();

  useEffect(() => {
    setPageHeader({ title, content, action });

    return () => {
      setPageHeader(null);
    };
  }, [action, content, setPageHeader, title]);

  return null;
}
