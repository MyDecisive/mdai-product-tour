import type { TourConfiguration } from "../types/tour";

const logFiles = import.meta.glob("../assets/logs/*.txt", {
  eager: true,
  query: "?raw",
});

export function getLogFile(fileName: string): string {
  const key = `../assets/logs/${fileName}`;
  if (!(key in logFiles)) {
    throw new Error(`Log file not found: ${fileName}`);
  }
  return (logFiles[key] as { default: string }).default;
}

const videoFiles = import.meta.glob("../assets/videos/*.mp4", { eager: true });

export function getVideoUrl(fileName: string): string {
  const key = `../assets/videos/${fileName}`;
  if (!(key in videoFiles)) {
    throw new Error(`Video file not found: ${fileName}`);
  }
  return (videoFiles[key] as { default: string }).default;
}

const tourConfigFiles = import.meta.glob("../assets/tours/*.yaml", {
  eager: true,
});

export function getTourConfigs() {
  return (
    Object.values(tourConfigFiles) as { default: TourConfiguration }[]
  ).map((module) => module.default);
}
