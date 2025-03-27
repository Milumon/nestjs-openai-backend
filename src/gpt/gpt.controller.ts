/* eslint-disable */

import { Controller, FileTypeValidator, Header, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('image-analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`;
          return callback(null, fileName);
        },
      }),
    }),
  )
  async imageAnalyzer(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024 * 5,
            message: 'File is bigger than 5 mb ',
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(process.env.OPENAI_API_KEY);
    return this.gptService.imageAnalyzer(file);
  }

}
