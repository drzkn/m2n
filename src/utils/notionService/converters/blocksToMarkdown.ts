import { NotionBlock, NotionRichText } from "../../../types/notion";

export class BlocksToMarkdownConverter {
  convert(blocks: NotionBlock[]): string {
    let markdown = "";

    for (const block of blocks) {
      switch (block.type) {
        case "paragraph":
          markdown += this._paragraphToMarkdown(block.paragraph!) + "\n\n";
          break;
        case "heading_1":
          markdown += this._headingToMarkdown(block.heading_1!, 1) + "\n\n";
          break;
        case "heading_2":
          markdown += this._headingToMarkdown(block.heading_2!, 2) + "\n\n";
          break;
        case "heading_3":
          markdown += this._headingToMarkdown(block.heading_3!, 3) + "\n\n";
          break;
        case "bulleted_list_item":
          markdown += this._listItemToMarkdown(block.bulleted_list_item!, "-") + "\n";
          break;
        case "numbered_list_item":
          markdown += this._listItemToMarkdown(block.numbered_list_item!, "1.") + "\n";
          break;
        case "code":
          markdown += this._codeToMarkdown(block.code!) + "\n\n";
          break;
      }
    }

    return markdown;
  }

  private _paragraphToMarkdown(paragraph: { rich_text: NotionRichText[] }): string {
    return paragraph.rich_text.map((text) => text.text.content).join("");
  }

  private _headingToMarkdown(
    heading: { rich_text: NotionRichText[] },
    level: number
  ): string {
    const content = heading.rich_text.map((text) => text.text.content).join("");
    return "#".repeat(level) + " " + content;
  }

  private _listItemToMarkdown(
    listItem: { rich_text: NotionRichText[] },
    prefix: string
  ): string {
    const content = listItem.rich_text.map((text) => text.text.content).join("");
    return `${prefix} ${content}`;
  }

  private _codeToMarkdown(code: {
    rich_text: NotionRichText[];
    language?: string;
  }): string {
    const content = code.rich_text.map((text) => text.text.content).join("");
    return "```" + (code.language || "") + "\n" + content + "\n```";
  }
} 