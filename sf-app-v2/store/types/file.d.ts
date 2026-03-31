export interface UploadedFile {
  filename: string;
  filesize: number;
  mimetype: string;
  url: string;
}

export interface FileState {
  uploadFile: (files: File[]) => Promise<UploadedFile[]>;
}
