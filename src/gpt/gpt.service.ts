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
import { textAnalyzeUseCase } from './use-cases/text-analysis.use-case';
import { TextAnalyzeDto } from './dtos/text-analysis.dto';


@Injectable()
export class GptService {
    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    private client: S3Client;

    constructor(
    ) {

        const s3_region = process.env.S3_REGION as string;

        if (!s3_region) {
            throw new Error('S3_REGION not found in environment variables');
        }

        const accessKeyId = process.env.S3_ACCESS_KEY as string;
        const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('S3_ACCESS_KEY or S3_SECRET_ACCESS_KEY not found in environment variables');
        }

        this.client = new S3Client({
            region: s3_region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey:
                    secretAccessKey,
            },
            forcePathStyle: true,
        });
        Logger.debug('S3 Client initialized'); 
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
            Logger.debug('key:', key);

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: isPublic ? 'public-read' : 'private',
                Metadata: {
                    originalName: file.originalname,
                },
            });

            const result = await this.client.send(command);
            Logger.debug('result:', result);
            return {
                url: isPublic
                    ? (await this.getFileUrl(key)).url
                    : (await this.getPresignedSignedUrl(key)).url,
                key,
                isPublic,
            };
        } catch (error) {
            Logger.error('Error analyzing image:', error);

            throw new InternalServerErrorException(error);
        }
    }

    async getFileUrl(key: string) {
        return { url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}` };
    }


    async getPresignedSignedUrl(key: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
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

    async textAnalyzer(textAnalyzeDto: TextAnalyzeDto) {
        try { 
            return await textAnalyzeUseCase(this.openai, { text: textAnalyzeDto.text });
        } catch (error) {
            Logger.error('Error analyzing image:', error);
            throw new InternalServerErrorException('Error analyzing image');
        }
    }
}
