import { IsNotEmpty } from "class-validator";

export class ImageAnalyzeDto {
  @IsNotEmpty()
  file: Express.Multer.File;
}
