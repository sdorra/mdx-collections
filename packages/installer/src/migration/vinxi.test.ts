import { PackageJson } from "src/packageJson.js";
import { describe, expect, it } from "vitest";
import { migratorVinxi } from "./vinxi.js";

describe("vinxi migrator", () => {
  const packageJson: PackageJson = {
    name: "something",
  };

  describe("isResponsible", () => {
    it("should be responsible for vinxi", () => {
      const responsible = migratorVinxi.isResponsible({
        name: "something",
        dependencies: {
          "vinxi": "0.5.1"
        },
      });
      expect(responsible).toBe(true);
    });

    it("should be responsible for vinxi in dev dependencies", () => {
      const responsible = migratorVinxi.isResponsible({
        name: "something",
        devDependencies: {
          "vinxi": "0.5.1"
        },
      });
      expect(responsible).toBe(true);
    });

    it("should not be responsible for next.js", () => {
      const responsible = migratorVinxi.isResponsible({
        name: "something",
        dependencies: {
          next: "14.3.1",
        },
      });
      expect(responsible).toBe(false);
    });
  });

  describe("options", () => {
    it("should parse options", () => {
      const options = migratorVinxi.options.parse({ demoContent: "none" });
      expect(options).toEqual({ demoContent: "none" });
    });
  });

  describe("migration", () => {
    it("should return tasks without demo content", async () => {
      const migration = await migratorVinxi.createMigration(
        {
          directory: "directory",
          packageJson,
        },
        {
          demoContent: "none",
        },
      );

      const names = migration.map((task) => task.name);
      expect(names).toEqual([
        "Install dependencies",
        "Add alias to tsconfig",
        "Modify vinxi configuration",
        "Add .content-collections to .gitignore",
        "Create configuration file",
      ]);
    });

    it("should return tasks with demo content", async () => {
      const migration = await migratorVinxi.createMigration(
        {
          directory: "directory",
          packageJson,
        },
        {
          demoContent: "markdown",
        },
      );

      const names = migration.map((task) => task.name);
      expect(names).toEqual([
        "Install dependencies",
        "Add alias to tsconfig",
        "Modify vinxi configuration",
        "Add .content-collections to .gitignore",
        "Create configuration file",
        "Create demo content",
      ]);
    });

    it("should add markdown package with markdown demo content", async () => {
      const migration = await migratorVinxi.createMigration(
        {
          directory: "directory",
          packageJson,
        },
        {
          demoContent: "markdown",
        },
      );

      const addDependenciesTask = migration.find(
        (task) => task.name === "Install dependencies",
      );
      if (!addDependenciesTask) {
        throw new Error("Task not found");
      }

      // @ts-expect-error - we know it's there
      const dependencies = addDependenciesTask.devDependencies;
      expect(dependencies).toContain("@content-collections/markdown");
    });

    it("should not add markdown package without demo content", async () => {
      const migration = await migratorVinxi.createMigration(
        {
          directory: "directory",
          packageJson,
        },
        {
          demoContent: "none",
        },
      );

      const addDependenciesTask = migration.find(
        (task) => task.name === "Install dependencies",
      );
      if (!addDependenciesTask) {
        throw new Error("Task not found");
      }

      // @ts-expect-error - we know it's there
      const dependencies = addDependenciesTask.devDependencies;
      expect(dependencies).not.toContain("@content-collections/markdown");
    });

    it("should add core and vite packages", async () => {
      const migration = await migratorVinxi.createMigration(
        {
          directory: "directory",
          packageJson,
        },
        {
          demoContent: "none",
        },
      );

      const addDependenciesTask = migration.find(
        (task) => task.name === "Install dependencies",
      );
      if (!addDependenciesTask) {
        throw new Error("Task not found");
      }

      // @ts-expect-error - we know it's there
      const dependencies = addDependenciesTask.devDependencies;
      expect(dependencies).toContain("@content-collections/core");
      expect(dependencies).toContain("@content-collections/vinxi");
    });
  });
});
