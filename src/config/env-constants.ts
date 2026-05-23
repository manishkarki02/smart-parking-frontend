import { z } from "zod/v4";

const schema = z.object({
  VITE_PUBLIC_URL: z.url().optional(),
  VITE_PORT: z.coerce.number().default(5173),
  VITE_API_BASE_URL: z.url(),
  VITE_GOOGLE_MAPS_API_KEY: z.string(),
  VITE_NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VITE_APP_NAME: z.string().default("Smart Parking"),
});

type EnvConfig = z.infer<typeof schema>;

class Environment {
  private static instance: Environment;
  private env: EnvConfig;
  private constructor() {
    console.log("Loading environment variables...", import.meta.env);
    const result = schema.safeParse({
      ...import.meta.env,
      ...(window.env || {}),
    });
    if (!result.success) {
      console.error(
        "Environment variable validation failed:",
        result.error.issues,
      );
      throw new Error("Invalid environment variables");
    }
    this.env = result.data;
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  public get config(): EnvConfig {
    return this.env;
  }
}

export const ENV = Environment.getInstance().config;
