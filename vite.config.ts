import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const localApiRoutes = new Map([
  ["/api/ai-career-advisor", "/api/ai-career-advisor.ts"],
  ["/api/ai-application-writer", "/api/ai-application-writer.ts"],
]);

const readRequestBody = (request: import("node:http").IncomingMessage) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });

const createRequestHeaders = (headers: import("node:http").IncomingHttpHeaders) => {
  const requestHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => requestHeaders.append(key, item));
    else if (typeof value === "string") requestHeaders.set(key, value);
  });
  return requestHeaders;
};

const sendApiResponse = async (response: Response, reply: import("node:http").ServerResponse) => {
  reply.statusCode = response.status;
  response.headers.forEach((value, key) => reply.setHeader(key, value));
  reply.end(Buffer.from(await response.arrayBuffer()));
};

const localApiPlugin = (): Plugin => ({
  name: "folio-local-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (request, reply, next) => {
      const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const modulePath = localApiRoutes.get(requestUrl.pathname);
      if (!modulePath) {
        next();
        return;
      }

      try {
        const body = request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await readRequestBody(request);
        const apiRequest = new Request(requestUrl.toString(), {
          method: request.method,
          headers: createRequestHeaders(request.headers),
          body,
        });
        const apiModule = await server.ssrLoadModule(modulePath);
        const apiResponse = await apiModule.default(apiRequest);
        await sendApiResponse(apiResponse, reply);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Local API request failed.";
        reply.statusCode = 500;
        reply.setHeader("content-type", "application/json");
        reply.end(JSON.stringify({ error: message }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) process.env[key] = value;
  });

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [localApiPlugin(), react(), mode === "development" && componentTagger()].filter(Boolean),
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          features: path.resolve(__dirname, "features/index.html"),
          faq: path.resolve(__dirname, "faq/index.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  };
});
