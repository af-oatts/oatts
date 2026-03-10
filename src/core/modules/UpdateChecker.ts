
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import getOattsVersion from "../utils/Version";

export type UpdateCheckResult = {
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
};

type Version = {
    major: number | undefined;
    minor: number | undefined;
    patch: number | undefined;
}

type ReleaseLite = {
    tag_name: string;
    name?: string;
    published_at: string;
    body?: string;
    html_url: string;
    draft: boolean;
    prerelease: boolean;
};

async function getLatestFromGithub(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json" }
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
    const data = (await res.json()) as ReleaseLite;
    return {
        tag: data.tag_name,
        name: data.name ?? data.tag_name,
        publishedAt: data.published_at,
        notes: data.body ?? "",
        htmlUrl: data.html_url,
        prerelease: false,
    };
}

export default async function CheckForUpdates(): Promise<UpdateCheckResult> {
    let latest = await getLatestFromGithub("af-oatts", 'oatts');
    let githubVersionStr = latest.tag;
    let githubAppVersion = getAppVersionNumbers(githubVersionStr);
    let githubContentVersion = getContentVersionNumbers(githubVersionStr);

    let localVersionStr = (await getOattsVersion()).versionStr;
    let localAppVersion = getAppVersionNumbers(localVersionStr);
    let localContentVersion = getContentVersionNumbers(localVersionStr);

    // App version comparison
    if (githubAppVersion.major != undefined && localAppVersion.major != undefined && githubAppVersion.major > localAppVersion.major) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }
    if (githubAppVersion.minor != undefined && localAppVersion.minor != undefined && githubAppVersion.minor > localAppVersion.minor) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }
    if (githubAppVersion.patch != undefined && localAppVersion.patch != undefined && githubAppVersion.patch > localAppVersion.patch) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }

    // Content version comparison
    if (githubContentVersion.major != undefined && localContentVersion.major != undefined && githubContentVersion.major > localContentVersion.major) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }
    if (githubContentVersion.minor != undefined && localContentVersion.minor != undefined && githubContentVersion.minor > localContentVersion.minor) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }
    if (githubContentVersion.patch != undefined && localContentVersion.patch != undefined && githubContentVersion.patch > localContentVersion.patch) {
        return { currentVersion: localVersionStr, latestVersion: githubVersionStr, updateAvailable: true };
    }

    return { currentVersion: localVersionStr, latestVersion: localVersionStr, updateAvailable: false };
}

function getAppVersionNumbers(versionString: string): Version {
    let separatorIndex = versionString.indexOf('_');

    let appVersionStr = versionString.substring(0, separatorIndex); // Probably includes junk

    // App Major
    let dotIndex = appVersionStr.indexOf('.');
    let appMajor = getLastNumberComponent(appVersionStr.substring(0, dotIndex));
    appVersionStr = appVersionStr.substring(dotIndex + 1);
    // App Minor
    dotIndex = appVersionStr.indexOf('.');
    let appMinor = getLastNumberComponent(appVersionStr.substring(0, dotIndex));
    appVersionStr = appVersionStr.substring(dotIndex + 1);
    // App Patch
    let appPatch = getLastNumberComponent(appVersionStr);

    return { major: appMajor, minor: appMinor, patch: appPatch };
}

function getContentVersionNumbers(versionString: string): Version {
    let separatorIndex = versionString.indexOf('_');
    let contentVersionStr = versionString.substring(separatorIndex + 1); // Probably includes junk

    // Content Major
    let dotIndex = contentVersionStr.indexOf('.');
    let contentMajor = getLastNumberComponent(contentVersionStr.substring(0, dotIndex));
    contentVersionStr = contentVersionStr.substring(dotIndex + 1);
    // Content Minor
    dotIndex = contentVersionStr.indexOf('.');
    let contentMinor = getLastNumberComponent(contentVersionStr.substring(0, dotIndex));
    contentVersionStr = contentVersionStr.substring(dotIndex + 1);
    // Content Patch
    let contentPatch = getFirstNumberComponent(contentVersionStr);

    return { major: contentMajor, minor: contentMinor, patch: contentPatch };
}

function getLastNumberComponent(substr: string): number | undefined {
    let num: number | undefined = undefined;
    for (let i = substr.length - 1; i >= 0; i--) {
        let n = Number(substr.charAt(i));
        if (Number.isNaN(n)) {
            break;
        }
        if (num == undefined) {
            num = n;
        }
        else {
            num += (n * (10 ** (substr.length - i - 1)))
        }
    }
    return num;
}

function getFirstNumberComponent(substr: string): number | undefined {
    let num: number | undefined = undefined;
    for (let i = 0; i < substr.length; i++) {
        let n = Number(substr.charAt(i));
        if (Number.isNaN(n)) {
            break;
        }
        if (num == undefined) {
            num = n;
        }
        else {
            num *= 10;
            num += n;
        }
    }
    return num;
}
