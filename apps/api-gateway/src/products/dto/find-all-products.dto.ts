import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class FindAllProductsDto {
  /** Optional search term (partial match on product name)
   * @example 'shoe'
   */
  @IsOptional()
  @IsString()
  name?: string;

  /** Minimum price filter
   * @example 9.99
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Maximum price filter
   * @example 99.99
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /** Minimum quantity filter
   * @example 2
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  /** Maximum quantity filter
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['name', 'price', 'quantity', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt' | 'updatedAt' =
    'createdAt';

  /** Sort order: ascending or descending */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  /** Results per page */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number = 10;

  /** Page number */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number = 1;
}
