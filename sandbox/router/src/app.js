import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";

const app = express();

app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      pathRewrite: { [`^/preview/${sandboxId}`]: '' },
    });
  }

  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}:3000`;

  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      pathRewrite: { [`^/agent/${sandboxId}`]: '' },
    });
  }

  return agentProxies[sandboxId];
}

app.use('/agent/:sandboxId', (req, res, next) => {
  return getAgentProxy(req.params.sandboxId)(req, res, next);
});

app.use('/preview/:sandboxId', (req, res, next) => {
  return getProxy(req.params.sandboxId)(req, res, next);
});

// Create the HTTP server explicitly
const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const parts = req.url.split('/');
  const type = parts[1];
  const sandboxId = parts[2];

  console.log(`WS upgrade request: ${req.url}, type: ${type}, sandboxId: ${sandboxId}`);

  if (type === "agent") {
    const proxy = getAgentProxy(sandboxId);
    proxy.upgrade(req, socket, head);
  } else if (type === "preview") {
    const proxy = getProxy(sandboxId);
    proxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

export default server;