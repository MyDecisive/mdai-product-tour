export interface Status {
  name: string;
  color: string;
  bgColor: string;
}

export type PodId = string;

export interface Pod {
  id: PodId;
  name: string;
  baseName: string;
  status: Status;
  useErrorFlow: boolean;
}

export type StatusString = string;
