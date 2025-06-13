import { BlocksToMarkdownConverter } from "../../converters/blocksToMarkdown";
import { NotionBlock } from "../../../../types/notion";

describe("BlocksToMarkdownConverter", () => {
  let converter: BlocksToMarkdownConverter;

  beforeEach(() => {
    converter = new BlocksToMarkdownConverter();
  });

  describe("convert", () => {
    it("debería convertir bloques de Notion a Markdown correctamente", () => {
      const blocks: NotionBlock[] = [
        {
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: "Título Principal" } }],
          },
        },
        {
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "Este es un párrafo" } }],
          },
        },
        {
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Elemento de lista" } }],
          },
        },
        {
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: 'console.log("Hola")' } }],
            language: "javascript",
          },
        },
      ];

      const markdown = converter.convert(blocks);

      expect(markdown).toContain("# Título Principal");
      expect(markdown).toContain("Este es un párrafo");
      expect(markdown).toContain("- Elemento de lista");
      expect(markdown).toContain('```javascript\nconsole.log("Hola")\n```');
    });

    it("debería manejar bloques vacíos", () => {
      const blocks: NotionBlock[] = [];
      const markdown = converter.convert(blocks);
      expect(markdown).toBe("");
    });
  });
}); 