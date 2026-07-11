import { app } from "./app";
import { env } from "./config/env";

const startServer = (port: number, attempt = 1) => {
  const server = app.listen(port, () => {
    console.log(`Habit tracker API listening on port ${port} (${env.nodeEnv})`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE" && attempt < 10) {
      console.warn(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1, attempt + 1);
      return;
    }

    console.error(error);
    process.exit(1);
  });
};

startServer(env.port);
