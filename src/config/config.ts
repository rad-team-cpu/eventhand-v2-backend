export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    mongoConnectionURI: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@event-hand-dev.pf5unz2.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&appName=event-hand-dev`,
  },
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_POKEMON_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET,
  },
});
