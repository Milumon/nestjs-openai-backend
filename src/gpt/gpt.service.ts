import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { imageAnalyzeUseCase } from './use-cases/image-analysis.use-case';
import OpenAI from 'openai';


@Injectable()
export class GptService {
    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    private client: S3Client;

    constructor(
        private readonly configService: ConfigService,
    ) {

        const s3_region = this.configService.get('S3_REGION');

        if (!s3_region) {
            throw new Error('S3_REGION not found in environment variables');
        }

        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('S3_ACCESS_KEY or S3_SECRET_ACCESS_KEY not found in environment variables');
        }

        this.client = new S3Client({
            region: s3_region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle: true,
        });

    }

    async uploadSingleFile({
        file,
        isPublic = true,
    }: {
        file: Express.Multer.File;
        isPublic: boolean;
    }) {
        try {
            const key = `${uuidv4()}`;

            const command = new PutObjectCommand({
                Bucket: this.configService.get('S3_BUCKET_NAME'),
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: isPublic ? 'public-read' : 'private',
                Metadata: {
                    originalName: file.originalname,
                },
            });
            await this.client.send(command);

            return {
                url: isPublic
                    ? (await this.getFileUrl(key)).url
                    : (await this.getPresignedSignedUrl(key)).url,
                key,
                isPublic,
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getFileUrl(key: string) {
        return { url: `https://${this.configService.get('S3_BUCKET_NAME')}.s3.amazonaws.com/${key}` };
    }


    async getPresignedSignedUrl(key: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.configService.get('S3_BUCKET_NAME'),
                Key: key,
            });

            const url = await getSignedUrl(this.client, command, {
                expiresIn: 60 * 60 * 24,
            });

            return { url };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async imageAnalyzer(imageFile: Express.Multer.File) {
        try {
            const imageFileURL = await this.uploadSingleFile({
                file: imageFile,
                isPublic: true,
            });
            if (!imageFileURL.url) {
                throw new InternalServerErrorException('Error uploading file');
            }
            return await imageAnalyzeUseCase(this.openai, { imageFileURL: imageFileURL.url });
        } catch (error) {
            Logger.error('Error analyzing image:', error);
            throw new InternalServerErrorException('Error analyzing image');
        }
    }
}
