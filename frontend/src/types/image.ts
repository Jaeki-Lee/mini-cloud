export interface Image {
  id: string;
  name: string;
  status: string;
  visibility: string;
  size?: number;
  diskFormat?: string;
  containerFormat?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageListResponse {
  images: Image[];
}