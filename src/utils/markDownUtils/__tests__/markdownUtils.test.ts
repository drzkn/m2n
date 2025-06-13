import fs from "fs/promises";
import path from "path";
import { MarkdownUtils } from "../markdownUtils";

// Mock de fs.promises
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  mkdir: jest.fn(),
}));

// Configurar los mocks
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  mkdir: jest.fn(),
};

// Reemplazar el mock por defecto con nuestro mock personalizado
jest.mocked(fs).readFile = mockFs.readFile;
jest.mocked(fs).writeFile = mockFs.writeFile;
jest.mocked(fs).readdir = mockFs.readdir;
jest.mocked(fs).mkdir = mockFs.mkdir;

describe("MarkdownUtils", () => {
  const testDir = "./test-markdown";
  const testFile = path.join(testDir, "test.md");
  const testContent = "# Test\n\nThis is a test file.";

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  describe("readMarkdownFile", () => {
    it("debería leer correctamente un archivo Markdown", async () => {
      mockFs.readFile.mockResolvedValue(testContent);

      const content = await MarkdownUtils.readMarkdownFile(testFile);

      expect(mockFs.readFile).toHaveBeenCalledWith(testFile, "utf-8");
      expect(content).toBe(testContent);
    });

    it("debería lanzar un error si el archivo no existe", async () => {
      const error = new Error("File not found");
      mockFs.readFile.mockRejectedValue(error);

      await expect(MarkdownUtils.readMarkdownFile(testFile)).rejects.toThrow(
        "Error al leer el archivo Markdown: File not found"
      );
    });
  });

  describe("writeMarkdownFile", () => {
    it("debería escribir correctamente un archivo Markdown", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await MarkdownUtils.writeMarkdownFile(testFile, testContent);

      expect(mockFs.mkdir).toHaveBeenCalledWith(path.dirname(testFile), {
        recursive: true,
      });
      expect(mockFs.writeFile).toHaveBeenCalledWith(testFile, testContent, "utf-8");
    });

    it("debería lanzar un error si no se puede escribir el archivo", async () => {
      const error = new Error("Permission denied");
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(error);

      await expect(
        MarkdownUtils.writeMarkdownFile(testFile, testContent)
      ).rejects.toThrow(
        "Error al escribir el archivo Markdown: Permission denied"
      );
    });
  });

  describe("listMarkdownFiles", () => {
    it("debería listar solo archivos Markdown", async () => {
      const files = ["test1.md", "test2.md", "test.txt", "test.js"];
      mockFs.readdir.mockResolvedValue(files);

      const markdownFiles = await MarkdownUtils.listMarkdownFiles(testDir);

      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
      expect(markdownFiles).toEqual(["test1.md", "test2.md"]);
    });

    it("debería devolver un array vacío si no hay archivos Markdown", async () => {
      const files = ["test.txt", "test.js"];
      mockFs.readdir.mockResolvedValue(files);

      const markdownFiles = await MarkdownUtils.listMarkdownFiles(testDir);

      expect(markdownFiles).toEqual([]);
    });

    it("debería lanzar un error si no se puede leer el directorio", async () => {
      const error = new Error("Directory not found");
      mockFs.readdir.mockRejectedValue(error);

      await expect(MarkdownUtils.listMarkdownFiles(testDir)).rejects.toThrow(
        "Error al listar archivos Markdown: Directory not found"
      );
    });
  });
}); 