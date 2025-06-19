export interface NotionDatabaseResponse {
  id: string;
  title: Array<{
    plain_text: string;
    href?: string;
  }>;
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  url: string;
  [key: string]: unknown;
}

export interface NotionPageResponse {
  id: string;
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  url: string;
  [key: string]: unknown;
}

export interface NotionUserResponse {
  id: string;
  name?: string;
  avatar_url?: string;
  type: 'person' | 'bot';
  person?: {
    email?: string;
  };
  [key: string]: unknown;
}

export interface NotionBlockResponse {
  id: string;
  type: string;
  [key: string]: unknown;
} 