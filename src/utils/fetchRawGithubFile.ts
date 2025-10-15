/**
 * Converts a GitHub file URL to its raw content URL
 * @param {string} url - GitHub file URL
 * @returns {string} Raw content URL
 */
function convertToRawUrl(url: string) {
  return url
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
}

/**
 * Fetches the contents of a file from a GitHub URL
 * @param {string} url - GitHub file URL (e.g., https://github.com/user/repo/blob/branch/path/file.yaml)
 * @returns {Promise<string>} The raw file contents as a string
 * @throws {Error} If the fetch fails
 */
export async function fetchGitHubFile(url: string) {
  try {
    const rawUrl = convertToRawUrl(url);
    const response = await fetch(rawUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    throw new Error(
      `Error fetching GitHub file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
