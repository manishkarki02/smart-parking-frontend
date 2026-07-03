import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";

export function PasswordField(props: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input {...props} type="password" />;
}
