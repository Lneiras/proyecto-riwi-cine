import "dotenv/config";

process.env.NODE_ENV = "test";

process.env.POSTGRES_HOST = "localhost";
process.env.POSTGRES_PORT = "5432";

process.env.REDIS_URL = "redis://localhost:6379";