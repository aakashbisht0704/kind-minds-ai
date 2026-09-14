import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { getAuth } from "./auth";

const startFetch = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request, env?: any, ctx?: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth")) {
      const d1 = env?.DB || (globalThis as any).DB || (globalThis as any).kindminds_db;
      const auth = getAuth(d1);
      return auth.handler(request);
    }
    return (startFetch as any)(request, env, ctx);
  },
};
