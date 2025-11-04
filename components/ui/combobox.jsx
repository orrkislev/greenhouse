// Combobox.jsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/utils/tw"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command.jsx"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.jsx"
import Button from "../Button"

export function Combobox({ items, value, onChange, placeholder = "Select..." }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Filter by label based on the current search
  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(item => item.label.toLowerCase().includes(q))
  }, [items, search])

  const selectedLabel = React.useMemo(
    () => items.find(item => item.value === value)?.label ?? null,
    [items, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedLabel ?? placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={(val) => {
              setSearch(val)
              setOpen(true) // keep it open while typing
            }}
          />
          <CommandList>
            <CommandEmpty>
              {search ? `${search} לא נמצא.` : "אין תוצאות."}
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.value}
                  // Use label for cmdk’s internal matching/highlighting
                  value={item.label}
                  onSelect={() => {
                    onChange(item.value)
                    setOpen(false)
                    setSearch("") // optional: clear search after select
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
