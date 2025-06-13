import { Client } from "@notionhq/client";

type BlockObjectRequest = Parameters<Client["blocks"]["children"]["append"]>[0]["children"][0];

export type NotionBlock = {
  type: "paragraph" | "heading_1" | "heading_2" | "heading_3" | "bulleted_list_item" | "numbered_list_item" | "code";
  paragraph?: {
    rich_text: NotionRichText[];
  };
  heading_1?: {
    rich_text: NotionRichText[];
  };
  heading_2?: {
    rich_text: NotionRichText[];
  };
  heading_3?: {
    rich_text: NotionRichText[];
  };
  bulleted_list_item?: {
    rich_text: NotionRichText[];
  };
  numbered_list_item?: {
    rich_text: NotionRichText[];
  };
  code?: {
    rich_text: NotionRichText[];
    language?: string;
  };
};

export type NotionRichText = {
  type: "text";
  text: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

export interface NotionBlocksResponse {
  object: string;
  results: NotionBlock[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface NotionPageResponse {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: string;
    id: string;
  };
  last_edited_by: {
    object: string;
    id: string;
  };
  cover: null;
  icon: null;
  parent: {
    type: string;
    database_id: string;
  };
  archived: boolean;
  properties: {
    [key: string]: {
      id: string;
      type: string;
      [key: string]: any;
    };
  };
  url: string;
} 