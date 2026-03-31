import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgCode } from 'src/modules/organization/entities/org-code.entity';
import { Organization } from 'src/modules/organization/entities/organization.entity';
import { Member } from '../member.entity';

@Injectable()
export class OrgCodeService {
  constructor(
    @InjectRepository(OrgCode)
    private readonly orgCodeRepository: Repository<OrgCode>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Verify an org code and return organization details
   * @param code Org code string
   */
  async verifyCode(code: string): Promise<Organization> {
    const orgCode = await this.orgCodeRepository.findOne({
      where: { code, deletedAt: null },
      relations: ['organization'],
    });

    if (!orgCode) {
      throw new NotFoundException(`Org code ${code} is invalid`);
    }

    if (orgCode.usedAt) {
      throw new BadRequestException(`Org code ${code} has already been used`);
    }

    const organization = orgCode.organization;

    if (
      !organization ||
      organization.deletedAt ||
      !organization.smollVetIsActive
    ) {
      throw new BadRequestException(
        `Organization for code ${code} is inactive or deleted`,
      );
    }

    // Return the organization details
    return organization;
  }

  async verifyAndUseCode(
    code: string,
    memberId: string,
  ): Promise<Organization> {
    const orgCode = await this.orgCodeRepository.findOne({
      where: { code, deletedAt: null },
      relations: ['organization'],
    });

    if (!orgCode) {
      throw new NotFoundException(`Org code ${code} is invalid`);
    }

    if (orgCode.usedAt) {
      throw new BadRequestException(`Org code ${code} has already been used`);
    }

    const organization = orgCode.organization;

    if (
      !organization ||
      organization.deletedAt ||
      !organization.smollVetIsActive
    ) {
      throw new BadRequestException(
        `Organization for code ${code} is inactive or deleted`,
      );
    }

    // ✅ Mark the code as used
    orgCode.usedAt = new Date();
    orgCode.usedBy = { id: memberId } as Member;
    await this.orgCodeRepository.save(orgCode);

    // ✅ Return organization details
    return organization;
  }

  async findUsedCodeByMember(memberId: string): Promise<OrgCode | null> {
    const code = await this.orgCodeRepository.findOne({
      where: {
        usedBy: { id: memberId },
        deletedAt: null,
        organization: { smollVetIsActive: true, codeAccessEnabled: true },
      },
      relations: ['organization'],
    });
    return code || null;
  }
}
