import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import * as recast from "recast";
import tsparser from "recast/parsers/typescript.js";
// we use babel parser for js because it looks like esprisma doesn't support spread elements
// @see https://github.com/benjamn/recast/issues/1154
import babelparser from "recast/parsers/babel.js";
import { Task } from "./index.js";

const b = recast.types.builders;

type VinxiConfig = {
  path: string;
  type: "esm" | "ts";
};

async function findVinxiConfig(
  directory: string,
): Promise<VinxiConfig | null> {
  let config = join(directory, "app.config.ts");
  if (existsSync(config)) {
    return { path: config, type: "ts" };
  }

  config = join(directory, "app.config.js");
  if (existsSync(config)) {
    return { path: config, type: "esm" };
  }

  return null;
}

export function modifyVinxiConfig(directory: string): Task {
  return {
    name: "Modify vinxi configuration",
    run: async () => {
      const vinxiConfig = await findVinxiConfig(directory);
      if (!vinxiConfig) {
        return {
          status: "error",
          message: "Could not find app.config.(js|ts) found",
        };
      }

      const content = await fs.readFile(vinxiConfig.path, "utf-8");

      if (content.includes("@content-collections/vinxi")) {
        return {
          status: "skipped",
          message: `@content-collections/vinxi already configured`,
        };
      }

      const ast = recast.parse(content, {
        parser: vinxiConfig.type === "ts" ? tsparser : babelparser,
      });

      const newImport = recast.parse(
        'import contentCollections from "@content-collections/vinxi";\n',
      ).program.body[0];

      // Insert the new import statement at the beginning
      ast.program.body.unshift(newImport);

      let error: string | null = "could not find defineConfig";

      recast.visit(ast, {
        visitCallExpression(path) {
          const { node } = path;

          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "defineConfig"
          ) {
            error = null;

            const configObject = node.arguments[0];
            if (!configObject) {
              error = "First argument of defineConfig is missing";
              return false;
            }

            if (configObject.type !== "ObjectExpression") {
              error =
                "First argument of defineConfig is not an ObjectExpression";
              return false;
            }

            let viteProperty = configObject.properties.find(
              (prop) =>
                prop.type !== "SpreadElement" &&
                prop.type !== "SpreadProperty" &&
                prop.key.type === "Identifier" &&
                prop.key.name === "vite",
            );

            if (!viteProperty) {
              // If 'plugins' doesn't exist, create it
              viteProperty = b.property(
                "init",
                b.identifier("vite"),
                b.objectExpression([]),
              );
              configObject.properties.push(viteProperty);
            }

            if (
              recast.types.namedTypes.ObjectProperty.check(viteProperty) ||
              recast.types.namedTypes.Property.check(viteProperty)
            ) {
              const value = viteProperty.value;
              if (recast.types.namedTypes.ObjectExpression.check(value)) {
                let pluginsProperty = value.properties.find(
                  (prop) =>
                    prop.type !== "SpreadElement" &&
                    prop.type !== "SpreadProperty" &&
                    prop.key.type === "Identifier" &&
                    prop.key.name === "plugins",
                );

                if (!pluginsProperty) {
                  // If 'plugins' doesn't exist, create it
                  pluginsProperty = b.property(
                    "init",
                    b.identifier("plugins"),
                    b.arrayExpression([]),
                  );
                  value.properties.push(pluginsProperty);
                }

                if (
                  recast.types.namedTypes.ObjectProperty.check(
                    pluginsProperty,
                  ) ||
                  recast.types.namedTypes.Property.check(pluginsProperty)
                ) {
                  const value = pluginsProperty.value;
                  if (recast.types.namedTypes.ArrayExpression.check(value)) {
                    value.elements.push(
                      b.callExpression(b.identifier("contentCollections"), []),
                    );
                  } else {
                    error = "plugins property is not an ArrayExpression";
                  }
                } else {
                  error =
                    "plugins property is not an ObjectProperty or Property";
                }
              } else {
                error = "vite property is not an ObjectExpression";
              }
            } else {
              error = "vite property is not an ObjectProperty or Property";
            }

            return false; // Stop further traversal
          }
        },
      });

      if (error) {
        return {
          status: "error",
          message: error,
        };
      }

      // Write the modified code back to the file
      await fs.writeFile(vinxiConfig.path, recast.print(ast).code);

      return {
        status: "changed",
        message: `Added @content-collections/vinxi to ${vinxiConfig.path}`,
      };
    },
  };
}
