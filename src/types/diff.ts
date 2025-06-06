import { ChangeType } from ".";

export interface FileDiff {
  file_path: string;
  change_type: ChangeType;
  old_content?: string;
  new_content?: string;
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
}

export interface DiffChunk {
  old_start: number;
  old_lines: number;
  new_start: number;
  new_lines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  old_line_number?: number;
  new_line_number?: number;
}