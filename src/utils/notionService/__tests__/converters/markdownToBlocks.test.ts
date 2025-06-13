import { MarkdownToBlocksConverter } from "../../converters/markdownToBlocks";
import { NotionBlock } from "../../../../types/notion";

describe("MarkdownToBlocksConverter", () => {
  let converter: MarkdownToBlocksConverter;

  beforeEach(() => {
    converter = new MarkdownToBlocksConverter();
  });

  describe("convert", () => {
    it("debería convertir Markdown a bloques de Notion correctamente", () => {
      const markdown = `# Título Principal
Este es un párrafo

- Elemento de lista

\`\`\`javascript
console.log("Hola");
\`\`\``;

      const blocks = converter.convert(markdown);

      expect(blocks).toHaveLength(4);
      expect(blocks[0]).toEqual({
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Título Principal" } }],
        },
      });
      expect(blocks[1]).toEqual({
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: "Este es un párrafo" } }],
        },
      });
      expect(blocks[2]).toEqual({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "Elemento de lista" } }],
        },
      });
      expect(blocks[3]).toEqual({
        type: "code",
        code: {
          rich_text: [{ type: "text", text: { content: 'console.log("Hola");' } }],
          language: "javascript",
        },
      });
    });

    it("debería manejar Markdown vacío", () => {
      const blocks = converter.convert("");
      expect(blocks).toHaveLength(0);
    });

    it("debería manejar listas numeradas", () => {
      const markdown = `1. Primer elemento
2. Segundo elemento`;

      const blocks = converter.convert(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0]).toEqual({
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: "Primer elemento" } }],
        },
      });
      expect(blocks[1]).toEqual({
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: "Segundo elemento" } }],
        },
      });
    });

    it("debería manejar diferentes niveles de encabezados", () => {
      const markdown = `# Título 1
## Título 2
### Título 3`;

      const blocks = converter.convert(markdown);

      expect(blocks).toHaveLength(3);
      expect(blocks[0]).toEqual({
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Título 1" } }],
        },
      });
      expect(blocks[1]).toEqual({
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Título 2" } }],
        },
      });
      expect(blocks[2]).toEqual({
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: "Título 3" } }],
        },
      });
    });

    it("debería manejar bloques de código sin lenguaje especificado", () => {
      const markdown = "```\nconsole.log('Hola');\n```";

      const blocks = converter.convert(markdown);

      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        type: "code",
        code: {
          rich_text: [{ type: "text", text: { content: "console.log('Hola');" } }],
          language: "",
        },
      });
    });
  });
}); 