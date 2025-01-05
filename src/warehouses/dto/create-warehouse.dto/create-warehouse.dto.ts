import { IsString, Length } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @Length(5, 200)
  location: string;
}
