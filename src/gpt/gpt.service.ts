import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { imageAnalyzeUseCase } from './use-cases/image-analysis.use-case';

@Injectable()
export class GptService {
    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async imageAnalyzer(imageFile: Express.Multer.File) {
        return await imageAnalyzeUseCase(this.openai, { imageFile });
    }
}
