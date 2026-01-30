import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
                dbName: configService.get<string>('MONGODB_DB_NAME'),
                connectionFactory: (connection) => {
                    connection.on('connected', () => {
                        console.log('✅ MongoDB connected successfully');
                    });
                    connection.on('error', (error) => {
                        console.error('❌ MongoDB connection error:', error);
                    });
                    connection.on('disconnected', () => {
                        console.log('⚠️ MongoDB disconnected');
                    });
                    return connection;
                },
            }),
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }
