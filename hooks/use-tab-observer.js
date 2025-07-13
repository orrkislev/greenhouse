import { useState, useRef, useEffect } from "react"

export function useTabObserver({
  onActiveTabChange
} = {}) {
  const [mounted, setMounted] = useState(false)
  const listRef = useRef(null)
  const onActiveTabChangeRef = useRef(onActiveTabChange)

  useEffect(() => {
    onActiveTabChangeRef.current = onActiveTabChange
  }, [onActiveTabChange])

  useEffect(() => {
    setMounted(true)

    const update = () => {
      if (listRef.current) {
        const tabs = listRef.current.querySelectorAll('[role="tab"]')
        for (const [i, el] of tabs.entries()) {
          if (el.getAttribute("data-state") === "active") {
            onActiveTabChangeRef.current?.(i, el)
          }
        }
      }
    }

    const resizeObserver = new ResizeObserver(update)
    const mutationObserver = new MutationObserver(update)

    if (listRef.current) {
      resizeObserver.observe(listRef.current)
      mutationObserver.observe(listRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    update()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    };
  }, [])

  return { mounted, listRef }
}
