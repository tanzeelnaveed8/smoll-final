import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgCodeService } from '../services/member.org-code.service';
import { VerifyOrgCodeDto } from '../dtos/verify-org-code.member.dto';

@ApiTags('Member Organization Code: Member Role')
@Controller('member/org-code')
export class OrgCodeController {
  constructor(private readonly orgCodeService: OrgCodeService) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Verify an organization code and return organization details',
  })
  @ApiResponse({
    status: 200,
    description: 'Org code valid, organization returned',
  })
  @ApiResponse({ status: 400, description: 'Code already used' })
  @ApiResponse({ status: 404, description: 'Code not found' })
  async verifyCode(@Body() body: VerifyOrgCodeDto) {
    const organization = await this.orgCodeService.verifyCode(body.code);
    return {
      valid: true,
      organization,
    };
  }
}
