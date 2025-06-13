import { NotionBlock } from "../../../types/notion";

export class MarkdownToBlocksConverter {
  convert(markdown: string): NotionBlock[] {
    const lines = markdown.split("\n");
    const blocks: NotionBlock[] = [];
    let currentListItems: NotionBlock[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = "";

    for (let line of lines) {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        } else {
          inCodeBlock = false;
          blocks.push({
            type: "code",
            code: {
              rich_text: [
                { type: "text", text: { content: codeContent.join("\n") } },
              ],
              language: codeLanguage,
            },
          });
          codeContent = [];
          continue;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      if (line.startsWith("#")) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, "");
        blocks.push({
          type: `heading_${level}` as "heading_1" | "heading_2" | "heading_3",
          [`heading_${level}`]: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s/, "");
        currentListItems.push({
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, "");
        currentListItems.push({
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (currentListItems.length > 0 && line.trim() === "") {
        blocks.push(...currentListItems);
        currentListItems = [];
        continue;
      }

      if (line.trim() !== "") {
        blocks.push({
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: line } }],
          },
        });
      }
    }

    if (currentListItems.length > 0) {
      blocks.push(...currentListItems);
    }

    return blocks;
  }
} 