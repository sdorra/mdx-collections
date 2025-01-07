import appCss from "@content-collections/sample-theme/sample.css?url";
import {
  Link,
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/start";
import * as React from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        <header id="top">
          <h1>ContentCrafter Inc.</h1>
          <p>
            From Worldly Wonders to Polished Perfection – Crafting Content That
            Captivates and Converts.
          </p>
          <nav>
            <Link to="/">Posts</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <a href="#top">↑ Back to top</a>
          <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
        </footer>
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
