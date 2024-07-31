import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { VendorsModule } from './vendors/vendors.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TagsModule } from './tags/tags.module';
import { VerificationModule } from './verification/verification.module';
import { PackagesModule } from './packages/packages.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { MatchmakerModule } from './matchmaker/matchmaker.module';
import { BookingModule } from './booking/booking.module';
import config from './config/config';
// import { ClerkModule } from './clerk/clerk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongoConnectionURI'),
      }),
      inject: [ConfigService],
    }),
    AuthenticationModule,
    UsersModule,
    EventsModule,
    VendorsModule,
    ReviewsModule,
    TagsModule,
    VerificationModule,
    PackagesModule,
    PortfolioModule,
    MatchmakerModule,
    BookingModule,
    // ClerkModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secretKey: configService.get<string>('clerk.secret'),
    //     publishableKey: configService.get<string>('clerk.publishable'),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
