export async function FetchFile(filePath: string, expectedContentType: string): Promise<string | undefined> {
  let response = await fetch(filePath);
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
    else if (expectedContentType == "text/yaml" && filePath.endsWith(".oatts"))
    {
      // Due to the .oatts files, they are returned with content type of text
      // so we can just pretend they're fine for now.
      let textResponse = await response.text();
      return textResponse;
    }
    else {
      console.warn(`Retrieved content type of ${contentType} for ${filePath} while ${expectedContentType} was expected`);
      return undefined;
    }
  }
}