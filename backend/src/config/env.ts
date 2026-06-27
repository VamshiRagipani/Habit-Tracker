import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    // Printed plainly (not thrown) so it's the first thing visible in
    // Render's deploy logs, with no stack trace noise.
    // eslint-disable-next-line no-console
    console.error(
      `\n✖ Missing required environment variable: ${name}\n` +
        `  Set it in Render → your service → Environment, then redeploy.\n` +
        `  (Local dev: copy .env.example to .env and fill it in.)\n`
    );
    process.exit(1);
  }
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  corsOrigins: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
