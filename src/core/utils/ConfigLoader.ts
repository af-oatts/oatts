import { OattsManifest } from "@/core/model/OattsModel";
import { parse } from "yaml";
import { FetchFile } from "./FileHelper";
import { OATTS_ROOT } from "./Globals";

const CONFIG_LOCATION: string = `${OATTS_ROOT}/manifest.yml`;

export default async function LoadConfig(): Promise<OattsManifest | undefined> {
  let configText = await FetchFile(CONFIG_LOCATION, "text/yaml");
  if (configText === undefined) {
    console.error("Error fetching config");
    return undefined;
  }
  let config: OattsManifest = parse(configText);

  return config;
}