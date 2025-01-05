import { IsNumber, Min } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  id_user: number;

  @IsNumber()
  id_product: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
