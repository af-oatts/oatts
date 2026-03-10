
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */


export async function FetchFile(filePath: string, expectedContentType: string): Promise<string | undefined> {
  console.log("Fetching " + filePath);
  
  let response = await fetch(filePath);
  console.log("Recieved: ");
  console.log(response);
  
  
  if (!response.ok) {
    console.error("Failed to fetch a file at", filePath);
    return undefined;
  } else {
    let contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf(expectedContentType) !== -1)
    {
      let textResponse = await response.text();
      return textResponse;
    } 
    else if (expectedContentType == "text/yaml" && filePath.endsWith(".yml"))
    {
      let textResponse = await response.text();
      return textResponse;
    }
    else {
      console.warn(`Retrieved content type of ${contentType} for ${filePath} while ${expectedContentType} was expected`);
      return undefined;
    }
  }
}