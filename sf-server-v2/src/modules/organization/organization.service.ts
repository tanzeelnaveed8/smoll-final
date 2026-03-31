import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginationParams,
  PaginationResult,
  paginate,
} from 'src/utils/pagination';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { OrgCode } from './entities/org-code.entity';
import { OrgCodeWithUserDto } from './dtos/org-code-with-user.dto';
import { FileService } from '../file/file.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrgCode)
    private readonly orgCodeRepository: Repository<OrgCode>,
    private readonly fileService: FileService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      // Normalize domain to lowercase if provided
      const domain = createOrganizationDto.domain
        ? createOrganizationDto.domain.toLowerCase()
        : null;

      // Check if organization with domain exists (including soft-deleted)
      let existingOrganization: Organization | null = null;
      if (domain) {
        existingOrganization = await this.organizationRepository.findOne({
          where: { domain },
          withDeleted: true,
        });
      }

      if (existingOrganization) {
        if (existingOrganization.deletedAt) {
          throw new ConflictException(
            'An organization with this domain exists but is deleted. Please contact administrator.',
          );
        }
        throw new ConflictException(
          'Organization with this domain already exists',
        );
      }

      // Create organization entity
      const organization = this.organizationRepository.create({
        ...createOrganizationDto,
        domain, // ensure lowercase domain or null
      });

      // Grant smollVet access if requested
      if (createOrganizationDto.smollVetAccess) {
        let startDate: Date;

        if (createOrganizationDto.smollVetAccessStartDate) {
          startDate = new Date(createOrganizationDto.smollVetAccessStartDate);
        } else {
          startDate = new Date(); // default to current date
        }

        organization.smollVetAccessStartDate = startDate;

        // Calculate end date: either provided or start + 365 days
        if (createOrganizationDto.smollVetAccessEndDate) {
          organization.smollVetAccessEndDate = new Date(
            createOrganizationDto.smollVetAccessEndDate,
          );
        } else {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 365);
          organization.smollVetAccessEndDate = endDate;
        }

        organization.smollVetIsActive = true;
      }

      // Save organization first to get its ID for codes
      const savedOrganization =
        await this.organizationRepository.save(organization);

      // Generate OrgCodes if requested
      if (
        createOrganizationDto.numberOfCodes &&
        createOrganizationDto.numberOfCodes > 0
      ) {
        const codes = [];
        for (let i = 0; i < createOrganizationDto.numberOfCodes; i++) {
          const code = this.orgCodeRepository.create({
            organization: savedOrganization,
          });
          codes.push(code);
        }
        await this.orgCodeRepository.save(codes);
      }

      return savedOrganization;
    } catch (error: any) {
      if (error instanceof ConflictException) throw error;

      // Handle unique constraint violation (Postgres)
      if (error.code === '23505') {
        throw new ConflictException(
          'Organization with this domain already exists',
        );
      }

      throw new BadRequestException('Failed to create organization');
    }
  }

  async findAll(
    paginationQuery?: PaginationParams,
  ): Promise<PaginationResult<Organization>> {
    const res = await paginate<Organization>(
      this.organizationRepository,
      paginationQuery ?? {},
      {
        order: { createdAt: 'DESC' },
      },
    );

    return res;
  }

  async findOne(id: string): Promise<Partial<Organization>> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      // relations: ['codes'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    try {
      const normalizedDomain =
        updateOrganizationDto.domain === ''
          ? null
          : (updateOrganizationDto.domain ?? undefined);

      if (normalizedDomain !== undefined) {
        const domainChanged = normalizedDomain !== organization.domain;
        if (domainChanged && normalizedDomain) {
          const existingOrganization =
            await this.organizationRepository.findOne({
              where: { domain: normalizedDomain },
              withDeleted: true,
            });

          if (existingOrganization && existingOrganization.id !== id) {
            if (existingOrganization.deletedAt) {
              throw new ConflictException(
                'An organization with this domain exists but is deleted. Please contact administrator.',
              );
            }
            throw new ConflictException(
              'Organization with this domain already exists',
            );
          }
        }
        organization.domain = normalizedDomain;
      }

      if (updateOrganizationDto.organizationName !== undefined) {
        organization.organizationName =
          updateOrganizationDto.organizationName as any;
      }
      if (updateOrganizationDto.contactDetails !== undefined) {
        organization.contactDetails =
          updateOrganizationDto.contactDetails as any;
      }
      if (updateOrganizationDto.domainGroupChatEnabled !== undefined) {
        organization.domainGroupChatEnabled =
          updateOrganizationDto.domainGroupChatEnabled;
      }
      if (updateOrganizationDto.codeGroupChatEnabled !== undefined) {
        organization.codeGroupChatEnabled =
          updateOrganizationDto.codeGroupChatEnabled;
      }
      if (updateOrganizationDto.smollVetIsActive !== undefined) {
        organization.smollVetIsActive = updateOrganizationDto.smollVetIsActive;
      }
      if (updateOrganizationDto.domainAccessEnabled !== undefined) {
        organization.domainAccessEnabled =
          updateOrganizationDto.domainAccessEnabled;
      }
      if (updateOrganizationDto.codeAccessEnabled !== undefined) {
        organization.codeAccessEnabled =
          updateOrganizationDto.codeAccessEnabled;
      }
      if (updateOrganizationDto.smollVetAccessStartDate !== undefined) {
        const v = updateOrganizationDto.smollVetAccessStartDate as any;
        organization.smollVetAccessStartDate =
          v === '' || v === null ? null : new Date(v);
      }
      if (updateOrganizationDto.smollVetAccessEndDate !== undefined) {
        const v = updateOrganizationDto.smollVetAccessEndDate as any;
        organization.smollVetAccessEndDate =
          v === '' || v === null ? null : new Date(v);
      }

      // Update smollVet access if requested
      if (updateOrganizationDto.smollVetAccess !== undefined) {
        if (updateOrganizationDto.smollVetAccess) {
          if (updateOrganizationDto.smollVetAccessStartDate) {
            // Use the provided start date
            const startDate = new Date(
              updateOrganizationDto.smollVetAccessStartDate,
            );
            organization.smollVetAccessStartDate = startDate;
            // Set end date to 365 days from the provided start date
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 365);
            organization.smollVetAccessEndDate = endDate;
            organization.smollVetIsActive = true;
          } else {
            // Use default behavior if no start date provided
            organization.activateSmollVetAccess();
          }
        } else {
          // Optionally revoke access
          organization.smollVetIsActive = false;
          organization.smollVetAccessStartDate = null;
          organization.smollVetAccessEndDate = null;
        }
      }

      return await this.organizationRepository.save(organization);
    } catch (error: any) {
      if (error instanceof ConflictException) throw error;
      if (error.code === '23505') {
        throw new ConflictException(
          'Organization with this domain already exists',
        );
      }
      throw new BadRequestException('Failed to update organization');
    }
  }

  async remove(id: string): Promise<void> {
    // Ensure organization exists
    const organization = await this.findOne(id);

    try {
      // Soft delete all related orgCodes first
      if (organization.codes && organization.codes.length > 0) {
        const codeIds = organization.codes.map((c) => c.id);
        await this.orgCodeRepository.softDelete(codeIds);
      }

      // Soft delete the organization
      await this.organizationRepository.softDelete(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete organization');
    }
  }

  async findByDomain(domain: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { domain },
    });
  }

  async getCodesWithMembers(orgId: string): Promise<OrgCodeWithUserDto[]> {
    // Fetch codes along with the member who used each code
    const codes = await this.orgCodeRepository.find({
      where: { organization: { id: orgId } },
      relations: ['usedBy'], // include the member who used the code
    });

    if (!codes || codes.length === 0) {
      throw new NotFoundException(
        `No codes found for organization ID ${orgId}`,
      );
    }

    // Map codes to DTO
    return codes.map((code) => ({
      code: code.code,
      usedAt: code.usedAt,
      maxUsageMonths: code.maxUsageMonths,
      member: code.usedBy
        ? {
          id: code.usedBy.id,
          email: code.usedBy.email,
          phone: code.usedBy.phone,
          name: code.usedBy.name,
        }
        : null,
    }));
  }

  async addCodesToOrganization(
    orgId: string,
    numberOfCodes: number,
    maxUsageMonths?: number | null,
  ): Promise<OrgCode[]> {
    // Validate organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    // Codes activation is active
    if (!organization.smollVetIsActive) {
      throw new BadRequestException(
        'Cannot add codes to an inactive organization',
      );
    }

    // Validate numberOfCodes
    if (!numberOfCodes || numberOfCodes <= 0) {
      throw new BadRequestException('Number of codes must be greater than 0');
    }

    // Validate maxUsageMonths range if provided
    if (
      maxUsageMonths !== undefined &&
      maxUsageMonths !== null &&
      (!Number.isInteger(maxUsageMonths) ||
        maxUsageMonths < 1 ||
        maxUsageMonths > 24)
    ) {
      throw new BadRequestException(
        'maxUsageMonths must be an integer between 1 and 24',
      );
    }

    try {
      // Create array of new codes
      const newCodes: OrgCode[] = [];
      for (let i = 0; i < numberOfCodes; i++) {
        const code = this.orgCodeRepository.create({
          organization: organization,
          maxUsageMonths: maxUsageMonths ?? null,
        });
        newCodes.push(code);
      }

      // Bulk save all codes at once
      const savedCodes = await this.orgCodeRepository.save(newCodes);

      return savedCodes;
    } catch (error) {
      throw new BadRequestException('Failed to add codes to organization');
    }
  }

  async deleteCodes(codes: string[]): Promise<{ deletedCount: number }> {
    if (!codes || codes.length === 0) {
      throw new BadRequestException('No codes provided for deletion');
    }

    try {
      const deleteResult = await this.orgCodeRepository.softDelete(codes);

      return { deletedCount: deleteResult.affected || 0 };
    } catch (error) {
      throw new BadRequestException('Failed to delete codes');
    }
  }

  async addGroupChatId(
    orgId: string,
    chatId: string,
    type: 'domain' | 'code',
  ): Promise<Organization> {
    const organization = (await this.findOne(orgId)) as Organization;

    if (type === 'domain') {
      if (organization.domainGroupChatId) {
        throw new ConflictException('Domain group chat ID is already set');
      }
      organization.domainGroupChatId = chatId;
    } else if (type === 'code') {
      if (organization.codeGroupChatId) {
        throw new ConflictException('Code group chat ID is already set');
      }
      organization.codeGroupChatId = chatId;
    }

    return await this.organizationRepository.save(organization);
  }

  async updateProfileImage(
    orgId: string,
    file: Express.Multer.File,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    try {
      const uploaded = await this.fileService.upload([file]);
      const image = uploaded[0];

      // Delete previous image if exists
      if (organization.profileImg?.url) {
        try {
          const key = new URL(organization.profileImg.url).pathname.slice(1);
          if (key) {
            await this.fileService.delete([key]);
          }
        } catch (_) {
          // ignore URL parse or delete failures
        }
      }

      organization.profileImg = image;
      return await this.organizationRepository.save(organization);
    } catch (error) {
      throw new BadRequestException('Failed to update organization image');
    }
  }

  async removeProfileImage(orgId: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    organization.profileImg = null;
    return await this.organizationRepository.save(organization);
  }
}
