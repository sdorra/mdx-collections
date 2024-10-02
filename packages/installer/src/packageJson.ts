import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import z from "zod";

const packageJsonSchema = z.object({
  name: z.string(),
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
});

export type PackageJson = z.infer<typeof packageJsonSchema>;

export async function readPackageJson(directory: string): Promise<PackageJson> {
  const packageJsonPath = join(directory, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.error("package.json not found in current directory");
    process.exit(1);
  }

  const packageJson: PackageJson = JSON.parse(
    await fs.readFile(packageJsonPath, "utf-8"),
  );
  return packageJson;
}
