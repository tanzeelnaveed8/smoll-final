import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { RoleGuard } from 'src/guards/role/role.guard';
import {
  AddCodesDto,
  CreateOrganizationDto,
} from './dtos/create-organization.dto';
import {
  OrganizationResponseDto,
  OrganizationListItemDto,
} from './dtos/organization-response.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { OrganizationService } from './organization.service';
import { OrgCodeWithUserDto } from './dtos/org-code-with-user.dto';
import { DeleteCodesDto } from './dtos/delete-codes.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiExtraModels } from '@nestjs/swagger';
import {
  PaginationQueryDto,
  PaginationResult,
  getPaginationResponseSchema,
} from 'src/utils/pagination';

@ApiTags('Organizations: Admin Role')
@ApiCookieAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN]) // Only admins can access these endpoints
@Controller('/admin/organizations')
@ApiExtraModels(OrganizationListItemDto)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.create(
      createOrganizationDto,
    );
    return plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations (paginated)' })
  @ApiResponse({ schema: getPaginationResponseSchema(OrganizationListItemDto) })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginationResult<OrganizationListItemDto>> {
    const res = await this.organizationService.findAll(query);
    const items = plainToInstance(OrganizationListItemDto, res.data, {
      excludeExtraneousValues: true,
    });

    return {
      ...res,
      data: items,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization retrieved successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.findOne(id);
    return plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_1234567890',
  })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.update(
      id,
      updateOrganizationDto,
    );
    return plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete organization by ID' })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Organization deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.organizationService.remove(id);
  }

  @Get(':id/codes')
  @ApiOperation({
    summary: 'Get all org codes with user details by organization ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Codes retrieved successfully',
    type: [OrgCodeWithUserDto],
  })
  async getCodesWithMembers(
    @Param('id') id: string,
  ): Promise<OrgCodeWithUserDto[]> {
    const codesWithMembers =
      await this.organizationService.getCodesWithMembers(id);
    return plainToInstance(OrgCodeWithUserDto, codesWithMembers, {
      excludeExtraneousValues: true,
    });
  }

  // ✅ NEW ENDPOINT: Add codes to organization
  @Post(':id/codes')
  @ApiOperation({
    summary: 'Add additional codes to an organization',
    description:
      'Generate and add new codes to an existing organization. The organization must be active. Optionally set maxUsageMonths (1–24). Validity is calculated from code activation date and is independent of domain validity.',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    example: 'org_1234567890',
  })
  @ApiBody({
    type: AddCodesDto,
    description: 'Number of codes to add and optional maxUsageMonths',
    examples: {
      example1: {
        summary: 'Add 10 codes with 6-month validity',
        value: {
          numberOfCodes: 10,
          maxUsageMonths: 6,
        },
      },
      example2: {
        summary: 'Add 50 codes (unlimited validity)',
        value: {
          numberOfCodes: 50,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Codes added successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Successfully added 10 codes to organization',
        },
        totalCodes: {
          type: 'number',
          example: 10,
        },
        codes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'code_abc123' },
              code: { type: 'string', example: 'XYZ789' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-08T12:00:00Z',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request or organization is inactive',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async addCodesToOrganization(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    addCodesDto: AddCodesDto,
  ) {
    const codes = await this.organizationService.addCodesToOrganization(
      id,
      addCodesDto.numberOfCodes,
      addCodesDto.maxUsageMonths,
    );

    return {
      message: `Successfully added ${codes.length} codes to organization`,
      totalCodes: codes.length,
      codes: codes.map((code) => ({
        id: code.id,
        code: code.code,
        createdAt: code.createdAt,
      })),
    };
  }

  @Post('codes/delete')
  @ApiOperation({ summary: 'Delete multiple org codes' })
  @ApiBody({ type: DeleteCodesDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Codes deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully deleted 3 codes' },
        deletedCount: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async deleteCodes(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    deleteCodesDto: DeleteCodesDto,
  ) {
    const { deletedCount } = await this.organizationService.deleteCodes(
      deleteCodesDto.codes,
    );

    return {
      message: `Successfully deleted ${deletedCount} codes`,
      deletedCount,
    };
  }

  @Post(':id/profile-image')
  @ApiOperation({ summary: 'Upload or replace organization profile image' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.updateProfileImage(
      id,
      file,
    );

    return plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id/profile-image')
  @ApiOperation({ summary: 'Remove organization profile image (DB only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  async removeProfileImage(
    @Param('id') id: string,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationService.removeProfileImage(id);
    return plainToInstance(OrganizationResponseDto, organization, {
      excludeExtraneousValues: true,
    });
  }
}
