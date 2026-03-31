import { createParamDecorator } from '@nestjs/common';
import { ClsContextService } from '../utils/cls-context.service';

export const GetRequestId = createParamDecorator(() => {
  return ClsContextService.getRequestId();
});

export const GetRequestContext = createParamDecorator(() => {
  return ClsContextService.getContext();
});
