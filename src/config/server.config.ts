export class ServerConfig {
    public readonly PORT: number = parseInt(process.env.PORT) || 3000;
    public readonly MONGODB_URL: string = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    public readonly MONGODB_DB_NAME: string = process.env.MONGODB_NAME || 'test';
    public readonly JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
    public readonly BCRYPT_SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
}
