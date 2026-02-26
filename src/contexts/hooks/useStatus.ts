import { useContext, useMemo } from "react";
import { StatusContext } from "../StatusContext";
import { Status } from "@/core/model/Status";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function useStatus(contentID: string) {
    const { statuses } = useContext(StatusContext);
    return statuses?.get(contentID);
}

export function useStatuses(contentIds: string[]): Map<string, Status | undefined> | undefined {
    const { statuses } = useContext(StatusContext);

    return useMemo(() => {
        if (!statuses) return undefined;
        return contentIds.reduce<Map<string, Status | undefined>>(
            (acc, id) => acc.set(id, statuses.get(id)),
            new Map()
        );
    }, [statuses, contentIds]);
}

export function useSetStatus() {
    const { setStatus } = useContext(StatusContext);
    return setStatus; 
}