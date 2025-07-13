export function mergeRefs(...inputRefs) {
  const filteredInputRefs = inputRefs.filter(Boolean)
  if (filteredInputRefs.length <= 1) {
    const firstRef = filteredInputRefs[0]
    return firstRef || null
  }
  return function mergedRefs(ref) {
    for (const inputRef of filteredInputRefs) {
      if (typeof inputRef === "function") {
        inputRef(ref)
      } else if (inputRef) {
        ;(inputRef).current = ref
      }
    }
  };
}
