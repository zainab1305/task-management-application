function getRequiredEnv(name: "MONGODB_URI" | "JWT_SECRET" | "ENCRYPTION_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  get mongodbUri() {
    return getRequiredEnv("MONGODB_URI");
  },
  get jwtSecret() {
    return getRequiredEnv("JWT_SECRET");
  },
  get encryptionSecret() {
    return getRequiredEnv("ENCRYPTION_SECRET");
  },
};

export const isProduction = env.nodeEnv === "production";
