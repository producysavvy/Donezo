import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  STORAGE_DRIVER: z.enum(["local"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("./local-uploads"),
  CRON_SECRET: z.string().min(16),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    APP_URL: process.env.APP_URL ?? "http://localhost:3000",
    STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
    LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR ?? "./local-uploads",
    CRON_SECRET: process.env.CRON_SECRET,
  });
}
