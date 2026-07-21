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

export interface IRawFilesAnalyticsSummary {
  total_files: number;
  total_folders: number;
  starred_files: number;
  shared_files: number;
  average_file_size?: number;
  average_file_size_human?: string;
}

export interface IRawFilesAnalyticsStorage {
  used_bytes: number;
  used_human?: string;
  limit_bytes: number;
  limit_human?: string;
  free_bytes: number;
  free_human?: string;
  usage_pct: number;
}

export interface IRawFilesTypeBreakdownItem {
  type: string;
  file_count: number;
  total_size: number;
  total_size_human?: string;
  percentage?: number;
}

export interface IRawFilesFolderItem {
  id: number;
  name: string;
  emoji?: string | null;
  file_count: number;
  total_size: number;
  total_size_human?: string;
}

export interface IRawFilesFolderBreakdown {
  folders: IRawFilesFolderItem[];
  without_folder?: {
    file_count: number;
    total_size: number;
    total_size_human?: string;
  };
}

export interface IRawFilesUploadActivityItem {
  period: string;
  file_count: number;
  total_size: number;
  total_size_human?: string;
}

export interface IRawFilesAnalyticsData {
  summary: IRawFilesAnalyticsSummary;
  storage: IRawFilesAnalyticsStorage;
  type_breakdown: IRawFilesTypeBreakdownItem[];
  folder_breakdown: IRawFilesFolderBreakdown;
  upload_activity: IRawFilesUploadActivityItem[];
  recent_files: IApiFile[];
  largest_files: IApiFile[];
}

export interface IRawFilesAnalyticsResponse {
  success: boolean;
  message?: string;
  data: IRawFilesAnalyticsData;
}
