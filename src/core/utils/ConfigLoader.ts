import { OldOattsConfig } from "@/core/model/OattsModel";
import { parse } from "yaml";
import { FetchFile } from "./FileHelper";
import { OATTS_ROOT } from "./Globals";

const CONFIG_LOCATION: string = `${OATTS_ROOT}/manifest.yml`;

export default async function LoadConfig(): Promise<OldOattsConfig | undefined> {
  let configText = await FetchFile(CONFIG_LOCATION, "text/yaml");
  if (configText === undefined) {
    console.error("Error fetching config");
    return undefined;
  }
  let config: OldOattsConfig = parse(configText);

  return config;
}