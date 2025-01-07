import fs from "fs/promises";
import { join } from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { modifyVinxiConfig } from "./vinxi.js";

describe("vinxi configuration", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "vinxi-config", name);

    // copy all files from source directory to tmpdir
    const files = await fs.readdir(source);
    for (const file of files) {
      let targetFilename = file;
      if (file.endsWith("_")) {
        targetFilename = file.slice(0, -1);
      }
      await fs.copyFile(join(source, file), join(tmpdir, targetFilename));
    }
  }

  tmpdirTest("should adjust simple app config", async ({ tmpdir }) => {
    await prepare(tmpdir, "simple");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const appConfig = await fs.readFile(join(tmpdir, "app.config.ts"), "utf-8");

    expect(appConfig).toContain(
      'import contentCollections from "@content-collections/vinxi";',
    );
    expect(appConfig).toContain("plugins: [contentCollections()]");
  });

  tmpdirTest("should adjust more complex app config", async ({ tmpdir }) => {
    await prepare(tmpdir, "more-complex");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const appConfig = await fs.readFile(join(tmpdir, "app.config.ts"), "utf-8");

    expect(appConfig).toContain(
      'import contentCollections from "@content-collections/vinxi";',
    );
    expect(appConfig).toContain(
      "plugins: [samplePlugin(), contentCollections()]",
    );
  });

  tmpdirTest("should adjust esm app config", async ({ tmpdir }) => {
    await prepare(tmpdir, "esm");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const appConfig = await fs.readFile(join(tmpdir, "app.config.js"), "utf-8");

    expect(appConfig).toContain(
      'import contentCollections from "@content-collections/vinxi";',
    );
    expect(appConfig).toContain("plugins: [contentCollections()]");
  });

  tmpdirTest("should return an error if config object is missing", async ({ tmpdir }) => {
    await prepare(tmpdir, "missing-config-object");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("First argument of defineConfig is missing");
  });

  tmpdirTest("should return an error if config file is missing", async ({ tmpdir }) => {
    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("Could not find app.config.(js|ts) found");
  });

  tmpdirTest("should skip if already configured", async ({ tmpdir }) => {
    await prepare(tmpdir, "already-configured");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("skipped");
  });

  tmpdirTest("should return an error if config object has wrong type", async ({ tmpdir }) => {
    await prepare(tmpdir, "wrong-type-of-config-object");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("First argument of defineConfig is not an ObjectExpression");
  });

  tmpdirTest("should return an error if vite property has wrong type", async ({ tmpdir }) => {
    await prepare(tmpdir, "wrong-type-of-vite-property");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("vite property is not an ObjectExpression");
  });

  tmpdirTest("should return an error if plugins property has wrong type", async ({ tmpdir }) => {
    await prepare(tmpdir, "wrong-type-of-plugins-property");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("plugins property is not an ArrayExpression");
  });

  tmpdirTest("should return an error if vite has wrong type", async ({ tmpdir }) => {
    await prepare(tmpdir, "wrong-type-of-vite");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("vite property is not an ObjectProperty or Property");
  });

  tmpdirTest("should return an error if plugins has wrong type", async ({ tmpdir }) => {
    await prepare(tmpdir, "wrong-type-of-plugins");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("error");
    expect(result.message).toBe("plugins property is not an ObjectProperty or Property");
  });

  tmpdirTest("should adjust tanstack start app config", async ({ tmpdir }) => {
    await prepare(tmpdir, "tanstack");

    const result = await modifyVinxiConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const appConfig = await fs.readFile(join(tmpdir, "app.config.ts"), "utf-8");

    expect(appConfig).toContain(
      'import contentCollections from "@content-collections/vinxi";',
    );
    expect(appConfig).toContain(
      "contentCollections()",
    );
  });

});
