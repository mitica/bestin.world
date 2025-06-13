export const createFolderIfNotExists = async (path: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    console.error(`Error creating folder ${path}:`, error);
  }
  return path;
};

export const fileExists = async (path: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.access(path);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false; // File does not exist
    }
    console.error(`Error checking file ${path}:`, error);
    throw error; // Re-throw other errors
  }
};
