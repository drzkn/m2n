-- Crear tabla para almacenar las páginas de markdown
CREATE TABLE IF NOT EXISTS markdown_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  notion_page_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notion_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  notion_created_time TIMESTAMP WITH TIME ZONE,
  notion_last_edited_time TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_markdown_pages_notion_page_id ON markdown_pages(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_markdown_pages_created_at ON markdown_pages(created_at);
CREATE INDEX IF NOT EXISTS idx_markdown_pages_updated_at ON markdown_pages(updated_at);
CREATE INDEX IF NOT EXISTS idx_markdown_pages_title ON markdown_pages USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_markdown_pages_content ON markdown_pages USING gin(to_tsvector('spanish', content));
CREATE INDEX IF NOT EXISTS idx_markdown_pages_tags ON markdown_pages USING gin(tags);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_markdown_pages_updated_at
    BEFORE UPDATE ON markdown_pages
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE markdown_pages ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (ajustar según tus necesidades de autenticación)
CREATE POLICY "Enable read access for all users" ON markdown_pages
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON markdown_pages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON markdown_pages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON markdown_pages
    FOR DELETE USING (auth.role() = 'authenticated'); 