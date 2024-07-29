import { describe, expect, vi, afterEach } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir";
import path from "node:path";
import { compile } from "./esbuild";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import bundleRequire from "bundle-require";

const params = vi.hoisted(() => {
  return {
    skipTsConfigWithDirectory: false,
    tsConfig: undefined,
  } as {
    skipTsConfigWithDirectory: boolean;
    tsConfig: any;
  };
});

vi.mock("bundle-require", async (importOriginal) => {
  const orig = await importOriginal<typeof bundleRequire>();
  return {
    ...orig,
    loadTsConfig: (directory?: string) => {
      if (params.tsConfig !== undefined) {
        return params.tsConfig;
      }
      if (directory) {
        if (params.skipTsConfigWithDirectory) {
          return;
        }
        return orig.loadTsConfig(directory);
      }
      return orig.loadTsConfig();
    },
  };
});

describe("esbuild", () => {
  afterEach(() => {
    params.skipTsConfigWithDirectory = false;
    params.tsConfig = undefined;
  });

  async function compileFile(tmpdir: string, name: string) {
    const p = path.join(__dirname, "__tests__", "esbuild", name);

    let configPath = p + ".ts";
    if (!existsSync(configPath)) {
      configPath = path.join(p, "index.ts");
    }

    const output = path.join(tmpdir, "out.mjs");

    await compile(configPath, output);

    return output;
  }

  async function compileAndImportFile(tmpdir: string, name: string) {
    const output = await compileFile(tmpdir, name);
    const mod = await import(output);
    return mod.default;
  }

  tmpdirTest("should compile simple module", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "simple");
    expect(output).toBe("hello world");
  });

  tmpdirTest(
    "should compile module with external module",
    async ({ tmpdir }) => {
      const output = await compileAndImportFile(tmpdir, "external");
      expect(output).toBe("helloWorld");
    }
  );

  tmpdirTest("should compile with internal module", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "internal");
    expect(output).toBe("hello world");
  });

  tmpdirTest("should compile with tsconfig paths", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "tsconfigPaths");
    expect(output).toBe("hello world");
  });

  tmpdirTest("should compile with dynamic import", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "dynamicImport");
    expect(await output()).toBe("hello world");
  });

  tmpdirTest(
    "should use loadTsConfig without parameters",
    async ({ tmpdir }) => {
      params.skipTsConfigWithDirectory = true;
      const output = await compileAndImportFile(tmpdir, "simple");
      expect(output).toBe("hello world");
    }
  );

  tmpdirTest(
    "should compile with dynamic import from alias",
    async ({ tmpdir }) => {
      const output = await compileFile(tmpdir, "aliasDynamicImport");
      const content = await readFile(output, "utf-8");
      expect(content).includes('import("@alias")');
    }
  );

  tmpdirTest("should use empty paths", async ({ tmpdir }) => {
    params.tsConfig = {
      data: {
      },
    };
    const output = await compileAndImportFile(tmpdir, "simple");
    expect(output).toBe("hello world");
  });
});
