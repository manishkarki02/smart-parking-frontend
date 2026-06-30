import { useEffect } from "react";
import { usePageHeader } from "@/common/components/AppLayout";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action, description: _description }: PageHeaderProps) {
  const { setPageHeader } = usePageHeader();

  useEffect(() => {
    setPageHeader({ title, action });

    return () => {
      setPageHeader(null);
    };
  }, [action, setPageHeader, title]);

  return null;
}
