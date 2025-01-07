import { PackageJson } from "src/packageJson.js";
import { ZodObject, ZodRawShape } from "zod";
import { Migrator } from "./migrator.js";
import { migratorNextJS } from "./next.js";
import { migratorQwik } from "./qwik.js";
import { migratorRemix } from "./remix.js";
import { migratorVinxi } from "./vinxi.js";
import { migratorVite } from "./vite.js";
import { migratorSvelteKit } from "./sveltekit.js";

const migrators = [
  migratorNextJS,
  migratorRemix,
  migratorQwik,
  migratorVinxi,
  migratorSvelteKit,
  migratorVite,
];

export function findMigrator(
  packageJson: PackageJson,
): Migrator<ZodObject<ZodRawShape>, any> {
  for (const migrator of migrators) {
    if (migrator.isResponsible(packageJson)) {
      return migrator;
    }
  }
  throw new Error(`unsupported package ${packageJson.name}`);
}
