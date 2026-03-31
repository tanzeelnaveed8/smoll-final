export interface UploadedFile {
  filename: string
  filesize: number
  mimetype: string
  url: string
}

export type Nullable<T> = T | null
