import type { Definition } from "../types/tour";
import { FRAME_TYPES, SIMULATORS } from "./constants";

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
  // Check cache first
  if (githubFileCache.has(url)) {
    return githubFileCache.get(url)!;
  }

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

const githubFileCache = new Map<string, string>();

export async function prefetchAllGitHubFiles(
  config: Definition
): Promise<void> {
  const urlsToFetch = new Set<string>();

  // Collect all unique GitHub URLs
  for (const step of config?.steps || []) {
    for (const subStep of step?.subSteps || []) {
      subStep.initialState?.config?.files?.forEach((file) => {
        urlsToFetch.add(file.url);
      });

      subStep.animation?.forEach((action) => {
        if (
          action.type === FRAME_TYPES.ADD &&
          action.simulator === SIMULATORS.CONFIG &&
          action.updates?.files
        ) {
          action.updates.files.forEach((file) => {
            urlsToFetch.add(file.url);
          });
        }
      });
    }
  }

  await Promise.all(
    Array.from(urlsToFetch).map((url) => prefetchGitHubFile(url))
  );
}

async function prefetchGitHubFile(url: string): Promise<void> {
  if (githubFileCache.has(url)) return;

  const content = await fetchGitHubFile(url);
  githubFileCache.set(url, content);
}
