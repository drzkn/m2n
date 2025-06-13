import React from 'react';
import Button from '../components/Button';

const Home: React.FC = () => {
  const handleClick = () => {
    console.log('Botón clickeado!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Prueba de Botones</h1>
      <div className="space-x-4">
        <Button onClick={handleClick} variant="primary">
          Botón Primario
        </Button>
        <Button onClick={handleClick} variant="secondary">
          Botón Secundario
        </Button>
        <Button onClick={handleClick} disabled>
          Botón Deshabilitado
        </Button>
      </div>
    </div>
  );
};

export default Home; 