export const createFolderIfNotExists = async (path: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    console.error(`Error creating folder ${path}:`, error);
  }
  return path;
};
