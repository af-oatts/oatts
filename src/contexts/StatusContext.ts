/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Status } from "@/core/model/Status";
import { createContext } from "react";



type StatusContextType = {
    statuses: Map<string, Status> | undefined,
    setStatus: (id: string, status: Status) => void

};

export const StatusContext = createContext<StatusContextType>({
    statuses: undefined,
    setStatus: () => { throw new Error('Not implemented; not in provider.'); }
});
