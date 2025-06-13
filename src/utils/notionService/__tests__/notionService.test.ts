import { NotionService } from "../notionService";
import { NotionBlocksResponse, NotionPageResponse } from "../../../types/notion";

const mockClient = {
  blocks: {
    children: {
      list: jest.fn(),
    },
  },
  pages: {
    create: jest.fn(),
  },
};

// Mock del cliente de Notion
jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => mockClient),
}));

describe("NotionService", () => {
  let notionService: NotionService;
  const mockApiKey = "test-api-key";
  const mockDatabaseId = "test-database-id";
  const mockBlockId = "test-block-id";

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    notionService = new NotionService(mockApiKey);
  });

  describe("blocksToMarkdown", () => {
    it("debería convertir bloques de Notion a Markdown correctamente", async () => {
      const mockBlocks: NotionBlocksResponse = {
        object: "list",
        results: [
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
        ],
        next_cursor: null,
        has_more: false,
      };

      mockClient.blocks.children.list.mockResolvedValue(mockBlocks);

      const markdown = await notionService.blocksToMarkdown(mockBlockId);

      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({ block_id: mockBlockId });
      expect(markdown).toContain("# Título Principal");
      expect(markdown).toContain("Este es un párrafo");
    });

    it("debería manejar errores de la API", async () => {
      const error = new Error("API Error");
      mockClient.blocks.children.list.mockRejectedValue(error);

      await expect(notionService.blocksToMarkdown(mockBlockId)).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("createPageFromMarkdown", () => {
    const mockTitle = "Test Page";
    const mockMarkdown = `# Título
Este es un párrafo

- Elemento de lista`;

    it("debería crear una página en Notion desde Markdown", async () => {
      const mockResponse: NotionPageResponse = {
        object: "page",
        id: "test-id",
        created_time: "2024-01-01T00:00:00Z",
        last_edited_time: "2024-01-01T00:00:00Z",
        created_by: { object: "user", id: "test-user" },
        last_edited_by: { object: "user", id: "test-user" },
        cover: null,
        icon: null,
        parent: { type: "database_id", database_id: mockDatabaseId },
        archived: false,
        properties: {},
        url: "https://notion.so/test",
      };
      mockClient.pages.create.mockResolvedValue(mockResponse);

      const response = await notionService.createPageFromMarkdown(
        mockDatabaseId,
        mockTitle,
        mockMarkdown
      );

      expect(mockClient.pages.create).toHaveBeenCalledWith({
        parent: { database_id: mockDatabaseId },
        properties: {
          title: {
            title: [{ text: { content: mockTitle } }],
          },
        },
        children: expect.arrayContaining([
          expect.objectContaining({
            type: "heading_1",
            heading_1: expect.any(Object),
          }),
          expect.objectContaining({
            type: "paragraph",
            paragraph: expect.any(Object),
          }),
          expect.objectContaining({
            type: "bulleted_list_item",
            bulleted_list_item: expect.any(Object),
          }),
        ]),
      });

      expect(response).toBe(mockResponse);
    });

    it("debería manejar errores de la API", async () => {
      const error = new Error("API Error");
      mockClient.pages.create.mockRejectedValue(error);

      await expect(
        notionService.createPageFromMarkdown(
          mockDatabaseId,
          mockTitle,
          mockMarkdown
        )
      ).rejects.toThrow("API Error");
    });
  });
}); 