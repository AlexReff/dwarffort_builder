import { Ref, useEffect, useRef } from "preact/hooks";

/** Returns a Ref<T> that will keep the specified variable updated */
export function useTrackedRef<T>(varToTrack: T): Ref<T> {
    const result = useRef<T>(null);
    useEffect(() => {
        result.current = varToTrack;
    }, [varToTrack]);
    return result;
}
