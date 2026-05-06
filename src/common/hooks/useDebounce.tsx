import React from "react";

function useDebounce<T>(value: T, delayMs: number = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(timeOut);
  }, [value, delayMs]);
  return debouncedValue;
}

export default useDebounce;
