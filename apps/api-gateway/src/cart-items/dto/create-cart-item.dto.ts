import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCartItemDto {
  /**
   * Product's ID
   * @example 'qwertyuiopasdfghjklzxcvbnm'
   */
  @IsNotEmpty()
  @IsString()
  productId: string;

  /**
   * Product's quantity
   * @example 10
   */
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
