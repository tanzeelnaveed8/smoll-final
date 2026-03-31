import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsContextService } from '../utils/cls-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    ClsContextService.run(() => {
      // Add request ID to response headers for debugging
      const requestId = ClsContextService.getRequestId();
      if (requestId) {
        res.setHeader('X-Request-ID', requestId);
      }

      next();
    });
  }
}
