import { Status } from "@/core/model/Status";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { StatusContext } from "../StatusContext";
import loadDatabase from "@/core/database/DatabaseLoader";
import { GetStatusesFromDB, WriteStatusToDB } from "@/core/database/Status";
import { useUser } from "../hooks/useUser";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function StatusProvider({ children }: { children: ReactElement[] }) {
    const databasePromise = useMemo(loadDatabase, []); // So we don't go loading the database again. 
    const [statuses, _setStatuses] = useState<Map<string, Status> | undefined>();
    const user = useUser().user;


    useEffect(() => { reloadFromDB() }, [])

    const reloadFromDB = async () => {
        if (!user) {
            throw new Error("Cannot load statuses from database, user is undefined!")
        }
        const database = await databasePromise;
        const newStatuses = await GetStatusesFromDB(database, user);
        _setStatuses(newStatuses);
    }


    const writeStatusToDB = async (id: string, status: Status) => {
        if (!user) {
            throw new Error("Cannot save status to database, user is undefined!")
        }
        const database = await databasePromise;
        await WriteStatusToDB(database, user, id, status);
    }

    const setStatus = (id: string, status: Status) => {
        _setStatuses((prev) => {
            if (!prev) {
                console.error('Tried to set status before database statuses could be loaded. Rejecting.')
                return undefined;
            }
            return new Map(prev).set(id, status);
        });
        writeStatusToDB(id, status);
    }

    return <StatusContext.Provider value={{ statuses, setStatus }}>
        {children}
    </StatusContext.Provider>

}