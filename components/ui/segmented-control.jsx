"use client";
import { Slottable } from "@radix-ui/react-slot"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { useTabObserver } from "@/hooks/use-tab-observer"
import { cn } from "@/lib/utils"
import React, { useState } from "react";
import { mergeRefs } from "@/lib/merge-refs"

const SegmentedControl = TabsPrimitive.Root

const FloatingBackground = ({
  isMounted,
  className,
  lineStyle
}) => (
  <div
    className={cn(
      "absolute inset-y-1 left-0 -z-10 rounded-md bg-background shadow-sm ring-1 ring-border/50 motion-safe:transition-transform motion-safe:duration-300 motion-safe:[transition-timing-function:cubic-bezier(0.65,0,0.35,1)]",
      {
        hidden: !isMounted,
      },
      className
    )}
    style={{
      transform: `translate3d(${lineStyle.left}px, 0, 0)`,
      width: `${lineStyle.width}px`,
    }}
    aria-hidden="true" />
)

const SegmentedControlList = ({
  children,
  className,
  floatingBgClassName,
  ref,
  ...rest
}) => {
  const [lineStyle, setLineStyle] = useState({ width: 0, left: 0 })

  const { mounted, listRef } = useTabObserver({
    onActiveTabChange: (_, activeTab) => {
      const { offsetWidth: width, offsetLeft: left } = activeTab
      setLineStyle({ width, left })
    },
  })

  return (
    (<TabsPrimitive.List
      ref={mergeRefs(ref, listRef)}
      className={cn(
        "relative isolate grid w-full auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1",
        className
      )}
      {...rest}>
      <Slottable>{children}</Slottable>
      <FloatingBackground isMounted={mounted} lineStyle={lineStyle} className={floatingBgClassName} />
    </TabsPrimitive.List>)
  );
}

const SegmentedControlTrigger = ({
  className,
  ref,
  ...rest
}) => {
  return (
    (<TabsPrimitive.Trigger
      ref={ref}
      className={cn(// base
      "peer", "relative z-10 h-8 whitespace-nowrap rounded-md px-2 text-sm font-medium text-muted-foreground outline-none", "flex items-center justify-center gap-1.5", "transition-all duration-300 ease-out", // hover
      "hover:text-foreground", // focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // active
      "data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)}
      {...rest} />)
  );
}

const SegmentedControlContent = ({
  ref,
  ...rest
}) => {
  return <TabsPrimitive.Content ref={ref} {...rest} />;
}

export {
  SegmentedControl,
  SegmentedControlList,
  SegmentedControlTrigger,
  SegmentedControlContent,
}
