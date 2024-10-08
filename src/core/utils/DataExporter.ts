import { GenericResult } from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { invoke } from '@tauri-apps/api/core';
import { open } from "@tauri-apps/plugin-dialog";
import getOattsVersion from "./Version";

export async function ExportUserProgress(user: User | undefined, informedConsentAttestation : string): Promise<GenericResult> {
  if (user === undefined)
    return new GenericResult(false, "Export failed, user not defined");

  const dir = await open({
    directory: true,
    multiple: false,
    title: "Select Export Save Path"
  });

  if (dir === undefined) {
    return new GenericResult(false, "Export canceled.");
  }

  try {
    let versionStr = (await getOattsVersion()).versionStr;
    await invoke("export_data", { userEmail: user.email, destination: dir, informedConsentAttestation: informedConsentAttestation, oattsVersion: versionStr });
    return new GenericResult(true);
  } catch(error) {
    return new GenericResult(false, `Failed to export, ${error}`);
  }
}