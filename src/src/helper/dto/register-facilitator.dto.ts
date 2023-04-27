// src/articles/dto/create-article.dto.ts
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterFacilitatorDto {
  @IsNotEmpty()
  first_name: string;

  last_name: string;

  @IsNotEmpty()
  mobile: number;

  @IsNotEmpty()
  parent_ip: number;
}
