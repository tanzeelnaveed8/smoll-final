import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  timestamp: Date;
}

@Injectable()
export class ClsContextService {
  private static readonly asyncStorage =
    new AsyncLocalStorage<RequestContext>();

  static run<T>(callback: () => T): T {
    const context: RequestContext = {
      requestId: uuidv4(),
      timestamp: new Date(),
    };

    return ClsContextService.asyncStorage.run(context, callback);
  }

  static getRequestId(): string | undefined {
    const context = ClsContextService.asyncStorage.getStore();
    return context?.requestId;
  }

  static getContext(): RequestContext | undefined {
    return ClsContextService.asyncStorage.getStore();
  }

  getRequestId(): string | undefined {
    return ClsContextService.getRequestId();
  }

  getContext(): RequestContext | undefined {
    return ClsContextService.getContext();
  }
}
