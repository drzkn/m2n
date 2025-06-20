const fs = require("fs");
const path = require("path");

const cleanMarkdownDirectory = () => {
  const outputDir = path.join(process.cwd(), "output", "markdown");

  try {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
      console.log("🧹 Carpeta output/markdown limpiada");
    } else {
      console.log("📁 Carpeta output/markdown no existía");
    }

    fs.mkdirSync(outputDir, { recursive: true });
    console.log("📁 Carpeta output/markdown creada y lista");
  } catch (error) {
    console.error("❌ Error al limpiar la carpeta:", error.message);
    process.exit(1);
  }
};

cleanMarkdownDirectory();
