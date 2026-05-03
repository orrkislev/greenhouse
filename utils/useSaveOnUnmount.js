import { useEffect, useRef } from 'react';

export function useSaveOnUnmount(getIsDirty, getData, onSave) {
    const ref = useRef({ getIsDirty, getData, onSave });
    ref.current = { getIsDirty, getData, onSave };
    useEffect(() => {
        return () => {
            if (ref.current.onSave && ref.current.getIsDirty()) {
                ref.current.onSave(ref.current.getData());
            }
        };
    }, []);
}
