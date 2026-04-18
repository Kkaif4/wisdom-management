export interface PrintOptions {
  elementId?: string;
  orientation?: "portrait" | "landscape";
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onError?: (error: Error) => void;
  waitForImages?: boolean;
}

export interface PrintQueueItem {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  options: PrintOptions;
  timestamp: Date;
}
