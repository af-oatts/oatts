
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { getVersion } from "@tauri-apps/api/app"
import LoadConfig from "./ConfigLoader";

type OattsVersion  = {
    appVersion: string,
    contentVersion: string | undefined
    versionStr: string
}

export default async function getOattsVersion() : Promise<OattsVersion> {
    let appVersion = await getVersion();
    let contentVersion = (await LoadConfig())?.versionNumber

    return  {
        appVersion: appVersion,
        contentVersion: contentVersion,
        versionStr: appVersion + "_" + contentVersion + "c"
    }
}