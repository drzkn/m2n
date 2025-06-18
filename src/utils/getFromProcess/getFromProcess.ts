export const getFromProcess = (processVariable: string) => {
  const value = import.meta.env[processVariable];
  if (!value) {
    console.error(`${processVariable} no está definido`);
    return '';
  }

  return value;
}