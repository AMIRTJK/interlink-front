import { IApiFile } from "./lib";

export interface IFilesAnalyticsSummary {
  files_count: number;
  folders_count: number;
  starred_count: number;
  shared_count: number;
}

export interface IFilesAnalyticsStorage {
  used_bytes: number;
  free_bytes: number;
  total_bytes: number;
  used_pct: number;
  used_bytes_human?: string;
  free_bytes_human?: string;
  total_bytes_human?: string;
}

export interface IFilesTypeBreakdownItem {
  type: string;
  count: number;
  total_size: number;
  total_size_human?: string;
  percentage?: number;
}

export interface IFilesFolderBreakdownItem {
  folder_id: number | null;
  folder_name: string;
  emoji: string | null;
  files_count: number;
  total_size: number;
  total_size_human?: string;
}

export interface IFilesUploadActivityItem {
  month: string;
  count: number;
  total_size: number;
  total_size_human?: string;
}

export interface IFilesAnalyticsData {
  summary: IFilesAnalyticsSummary;
  storage: IFilesAnalyticsStorage;
  type_breakdown: IFilesTypeBreakdownItem[];
  folder_breakdown: IFilesFolderBreakdownItem[];
  upload_activity: IFilesUploadActivityItem[];
  recent_files: IApiFile[];
  largest_files: IApiFile[];
}

export interface IFilesAnalyticsResponse {
  success: boolean;
  data: IFilesAnalyticsData;
}
