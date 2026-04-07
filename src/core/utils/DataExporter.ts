
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

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
  console.log("Over here");
  

  if (dir === undefined || dir === null) {
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