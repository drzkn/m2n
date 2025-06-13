require("dotenv").config();
const fs = require("fs");
const { Client } = require("@notionhq/client");
const { unified } = require("unified");
const remarkParse = require("remark-parse");

// Inicializa el cliente de Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const parseMarkdown = async (filePath) => {
  const markdown = fs.readFileSync(filePath, "utf-8");
  const tree = unified().use(remarkParse).parse(markdown);
  return tree.children;
};

// Convierte nodos de Markdown en bloques de Notion
const transformNodeToNotionBlock = (node) => {
  if (node.type === "heading") {
    const content = node.children.map((child) => child.value).join("");
    return {
      object: "block",
      type: `heading_${node.depth}`,
      [`heading_${node.depth}`]: {
        rich_text: [{ type: "text", text: { content } }],
      },
    };
  }

  if (node.type === "paragraph") {
    const content = node.children.map((child) => child.value).join("");
    return {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content } }],
      },
    };
  }

  return null;
};

// Función principal
const createPageFromMarkdown = async () => {
  const nodes = await parseMarkdown("./markdown/example.md");
  const blocks = nodes.map(transformNodeToNotionBlock).filter(Boolean); // elimina los nulos

  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      title: [{ type: "text", text: { content: "Markdown Importado 🚀" } }],
    },
    children: blocks,
  });

  console.log("Página creada en Notion:", response.url);
};

createPageFromMarkdown();
