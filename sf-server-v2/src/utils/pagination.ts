import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { FindManyOptions, Repository } from 'typeorm';

export class PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  count: number;
  currentPage: number;
  nextPage: number | null;
}

export function getPaginationResponseSchema(itemSchema: any) {
  return {
    allOf: [
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(itemSchema) },
          },
          count: { type: 'number' },
          currentPage: { type: 'number' },
          nextPage: { type: 'number', nullable: true },
        },
      },
    ],
  };
}

export async function paginate<T>(
  repository: Repository<T>,
  paginationQuery: PaginationParams,
  findOptions: FindManyOptions<T>,
): Promise<PaginationResult<T>> {
  const { page, limit } = paginationQuery;

  const _page = page ?? 1;
  const _limit = limit ?? 10;

  const [results, total] = await repository.findAndCount({
    ...findOptions,
    take: _limit,
    skip: (_page - 1) * _limit,
  });

  return {
    data: results,
    count: total,
    currentPage: _page,
    nextPage: total / _limit > _page ? _page + 1 : null,
  };
}
