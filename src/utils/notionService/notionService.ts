import { Client } from "@notionhq/client";
import {
  NotionBlock,
  NotionBlocksResponse,
  NotionPageResponse,
} from "../../types/notion";
import { BlocksToMarkdownConverter, MarkdownToBlocksConverter } from "./converters";

type BlockObjectRequest = Parameters<Client["blocks"]["children"]["append"]>[0]["children"][0];

export class NotionService {
  private notion: Client;
  private blocksToMarkdownConverter: BlocksToMarkdownConverter;
  private markdownToBlocksConverter: MarkdownToBlocksConverter;

  constructor(apiKey: string) {
    this.notion = new Client({ auth: apiKey });
    this.blocksToMarkdownConverter = new BlocksToMarkdownConverter();
    this.markdownToBlocksConverter = new MarkdownToBlocksConverter();
  }

  async blocksToMarkdown(blockId: string): Promise<string> {
    const blocks = await this.notion.blocks.children.list({
      block_id: blockId,
    });

    return this.blocksToMarkdownConverter.convert((blocks as NotionBlocksResponse).results);
  }

  async createPageFromMarkdown(
    databaseId: string,
    title: string,
    markdownContent: string
  ): Promise<NotionPageResponse> {
    const blocks = this.markdownToBlocksConverter.convert(markdownContent);

    const response = await this.notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: blocks as BlockObjectRequest[],
    });

    return response as NotionPageResponse;
  }
} 