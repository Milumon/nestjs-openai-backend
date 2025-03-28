import { IsString } from "class-validator";

export class TextAnalyzeDto {
    @IsString()
    readonly text: string
}
