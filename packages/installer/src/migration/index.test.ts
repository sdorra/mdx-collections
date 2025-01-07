import { describe, expect, it } from "vitest";
import { findMigrator } from "./index.js";

describe("findMigrator", () => {
  it("should find next.js migrator", () => {
    const migrator = findMigrator({
      name: "next.js",
      dependencies: {
        next: "14.3.1",
      },
    });
    expect(migrator).not.toBe(null);
    expect(migrator.name).toBe("next");
  });

  it("should find remix migrator", () => {
    const migrator = findMigrator({
      name: "remix",
      dependencies: {
        "@remix-run/node": "^2.13.1",
        "@remix-run/react": "^2.13.1",
        "@remix-run/serve": "^2.13.1",
      },
    });
    expect(migrator).not.toBe(null);
    expect(migrator.name).toBe("remix");
  });

  it("should find tanstack migrator", () => {
    const migrator = findMigrator({
      name: "tanstack",
      dependencies: {
        "@tanstack/start": "^1.95.1",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "vinxi": "0.5.1"
      },
    });
    expect(migrator).not.toBe(null);
    expect(migrator.name).toBe("tanstack");
  });

  it("should throw error if migrator could not be found", () => {
    expect(() =>
      findMigrator({
        name: "something",
      }),
    ).toThrowError("unsupported package something");
  });
});
