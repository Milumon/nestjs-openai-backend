import { Controller, FileTypeValidator, Get, Header, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) { }

  @Get('health')
  @Header('Cache-Control', 'none')
  healthCheck() {
    return { status: 'ok' };
  }

  @Post('image-analyze')
  @UseInterceptors(FileInterceptor('file'))
  async imageAnalyzer(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(webp|jpeg|jpg|png)' }),
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024 * 5,
            message: 'File is bigger than 5 mb ',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.gptService.imageAnalyzer(file);
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    return this.gptService.getFileUrl(key);
  }

  @Get('/signed-url/:key')
  async getSingedUrl(@Param('key') key: string) {
    return this.gptService.getPresignedSignedUrl(key);
  }
}
