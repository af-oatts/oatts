
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { OattsManifest } from "@/core/model/OattsModel";
import { parse } from "yaml";
import { FetchFile } from "./FileHelper";
import { OATTS_ROOT } from "./Globals";

export const CONFIG_LOCATION: string = `${OATTS_ROOT}/manifest.yml`;

export default async function LoadConfig(): Promise<OattsManifest | undefined> {
  let configText = await FetchFile(CONFIG_LOCATION, "text/yaml");
  if (configText === undefined) {
    console.error("Error fetching config");
    return undefined;
  }
  let config: OattsManifest = parse(configText);

  return config;
}
