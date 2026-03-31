import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MastermindGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const mastermindCookie = request.cookies['mastermind'];

    if (!mastermindCookie) {
      throw new UnauthorizedException(
        'Unauthorized access to mastermind functionality',
      );
    }

    // Check if the mastermind cookie matches the expected value from environment variables
    const expectedToken =
      process.env.MASTERMIND_TOKEN || 'mastermind-secret-token';

    if (mastermindCookie !== expectedToken) {
      throw new UnauthorizedException('Invalid authentication');
    }

    return true;
  }
}
