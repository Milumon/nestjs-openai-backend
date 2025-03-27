import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // OPENAI_API_KEY=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
  // S3_ACCESS_KEY=AKIA2M4RQ3F6CUKM4MOJ
  // S3_SECRET_ACCESS_KEY=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
  // S3_REGION="us-east-1"
  // S3_BUCKET_NAME="hackathon-bucket-s3"
  Logger.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY}`);
  Logger.log(`🔑 S3_ACCESS_KEY: ${process.env.S3_ACCESS_KEY}`);
  Logger.log(`🔑 S3_SECRET_ACCESS_KEY ${process.env.S3_SECRET_ACCESS_KEY}`)
  Logger.log(`🔑 S3_REGION: ${process.env.S3_REGION}`)
  Logger.log(`🔑 S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME}`);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
