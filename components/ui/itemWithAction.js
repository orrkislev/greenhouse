import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function ItemWithAction({ label, actions, className }) {
  return (
    <div className={cn("group flex items-center justify-between px-2 py-1 rounded hover:bg-muted transition", className)}>
      <div className="text-sm text-foreground">{label}</div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <TooltipProvider>
          {actions.map((action, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={action.onClick}
                  aria-label={action.label || `action-${idx}`}
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {action.label && <TooltipContent>{action.label}</TooltipContent>}
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
