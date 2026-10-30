import type { ComponentProps } from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { cn } from "@/shared/utils/cn";

/** Show/hide a section (shadcn/ui on Radix). The trigger carries `aria-expanded`. */
export const Collapsible = (props: ComponentProps<typeof CollapsiblePrimitive.Root>) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
);

export const CollapsibleTrigger = (
  props: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>
) => <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;

export const CollapsibleContent = ({
  className,
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => (
  <CollapsiblePrimitive.CollapsibleContent
    data-slot="collapsible-content"
    className={cn("data-[state=open]:animate-in data-[state=open]:fade-in-0", className)}
    {...props}
  />
);
