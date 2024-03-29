import { describe, expect, it } from "vitest";
import { compileMarkdown } from ".";
import { Context, Meta } from "@content-collections/core";

type Cache = Context["cache"];

const cache: Cache = (input, fn) => {
  return fn(input) as any;
};

const sampleMeta: Meta = {
  directory: "post",
  extension: ".mdx",
  filePath: "post/index.mdx",
  fileName: "index",
  path: "/post",
};

describe("markdown", () => {
  it("should convert markdown to html", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello World!",
      }
    );

    expect(html).toBe("<h1>Hello World!</h1>");
  });

  it("should apply remark plugins", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello World!",
      },
      {
        remarkPlugins: [
          () => (tree) => {
            tree.children[0].children[0].value = "Hello Universe!";
          },
        ],
      }
    );

    expect(html).toBe("<h1>Hello Universe!</h1>");
  });

  it("should apply rehype plugins", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello World!",
      },
      {
        rehypePlugins: [
          () => (tree) => {
            tree.children[0].children[0].value = "Hello Universe!";
          },
        ],
      }
    );

    expect(html).toBe("<h1>Hello Universe!</h1>");
  });

  it("should add meta to vfile data", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello World!",
      },
      {
        remarkPlugins: [
          () => (tree, vfile) => {
            // @ts-ignore - vfile data is not typed
            tree.children[0].children[0].value = `Hello from ${vfile.data._meta.path}`;
          },
        ],
      }
    );

    expect(html).toBe("<h1>Hello from /post</h1>");
  });

  it("should not allow html in markdown", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello <strong>World</strong>!",
      }
    );

    expect(html).toBe("<h1>Hello World!</h1>");
  });

  it("should allow html in markdown", async () => {
    const html = await compileMarkdown(
      { cache },
      {
        _meta: sampleMeta,
        content: "# Hello <strong>World</strong>!",
      },{
        allowDangerousHtml: true
      }
    );

    expect(html).toBe("<h1>Hello <strong>World</strong>!</h1>");
  });
});
