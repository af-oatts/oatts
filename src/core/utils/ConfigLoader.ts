import { OattsConfig } from "@/core/model/OattsModel";
import { parse } from "yaml";
import { FetchFile } from "./FileHelper";
import { OATTS_ROOT } from "./Globals";

const CONFIG_LOCATION: string = `${OATTS_ROOT}/.oatts`;

export default async function LoadConfig(): Promise<OattsConfig | undefined> {
  let configText = await FetchFile(CONFIG_LOCATION, "text/yaml");
  if (configText === undefined) {
    console.error("Error fetching config");
    return undefined;
  }
  let config: OattsConfig = parse(configText);

  return config;
}