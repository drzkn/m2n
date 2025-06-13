import fs from "fs/promises";
import path from "path";

export class MarkdownUtils {
  static async readMarkdownFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Error al leer el archivo Markdown: ${(error as Error).message}`);
    }
  }

  static async writeMarkdownFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Error al escribir el archivo Markdown: ${(error as Error).message}`
      );
    }
  }

  static async listMarkdownFiles(directory: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directory);
      return files.filter((file) => file.endsWith(".md"));
    } catch (error) {
      throw new Error(`Error al listar archivos Markdown: ${(error as Error).message}`);
    }
  }
} 