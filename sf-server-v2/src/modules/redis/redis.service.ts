import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from 'src/configs/logger';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = Logger.getInstance();
  private static redisClient: Redis | null = null;
  private readonly redisEnabled: boolean;
  private readonly fallbackStore = new Map<
    string,
    { value: string; expiresAt: number | null }
  >();
  private readonly fallbackGcInterval: NodeJS.Timeout;
  private warningShown = false;
  private lastWarningAt = 0;
  private readonly warningCooldownMs = 60 * 1000;

  constructor(private configService: ConfigService) {
    this.redisEnabled =
      this.configService.get<string>('REDIS_ENABLED', 'true') === 'true';

    this.fallbackGcInterval = setInterval(
      () => this.cleanupExpiredFallbackEntries(),
      30_000,
    );

    if (!this.redisEnabled) {
      this.logWarningOnce(
        '[LOG: REDIS] REDIS_ENABLED=false. Using in-memory fallback cache.',
      );
      return;
    }

    if (!RedisService.redisClient) {
      RedisService.redisClient = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          // Exponential backoff with an upper bound to avoid noisy reconnect loops.
          const delayMs = Math.min(30_000, Math.max(500, 2 ** times * 100));
          this.logWarningOnce(
            `[LOG: REDIS] Connection unavailable. Retrying in ${delayMs}ms (attempt ${times}).`,
          );
          return delayMs;
        },
      });

      RedisService.redisClient.on('error', (err) => {
        this.logWarningOnce(
          `[LOG: REDIS] Unavailable. Falling back to in-memory cache. Cause: ${err?.message ?? err}`,
        );
      });

      RedisService.redisClient.on('connect', () => {
        if (this.warningShown) {
          this.logger.info(
            '[LOG: REDIS] Connection restored. Using Redis cache.',
          );
        }
        this.warningShown = false;
      });
    }
  }

  private get redis(): Redis | null {
    return RedisService.redisClient;
  }

  private logWarningOnce(message: string) {
    const now = Date.now();
    if (!this.warningShown || now - this.lastWarningAt >= this.warningCooldownMs) {
      this.logger.warn(message);
      this.warningShown = true;
      this.lastWarningAt = now;
    }
  }

  private cleanupExpiredFallbackEntries() {
    const now = Date.now();
    for (const [key, record] of this.fallbackStore.entries()) {
      if (record.expiresAt && record.expiresAt <= now) {
        this.fallbackStore.delete(key);
      }
    }
  }

  private setFallback(key: string, value: string, expirySeconds?: number) {
    const expiresAt = expirySeconds ? Date.now() + expirySeconds * 1000 : null;
    this.fallbackStore.set(key, { value, expiresAt });
  }

  private getFallback(key: string): string | null {
    const record = this.fallbackStore.get(key);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt <= Date.now()) {
      this.fallbackStore.delete(key);
      return null;
    }
    return record.value;
  }

  private deleteFallback(key: string): number {
    return this.fallbackStore.delete(key) ? 1 : 0;
  }

  private async withRedisFallback<T>(
    operation: (redis: Redis) => Promise<T>,
    fallback: () => T | Promise<T>,
  ): Promise<T> {
    const client = this.redis;
    if (!this.redisEnabled || !client) {
      return fallback();
    }

    try {
      return await operation(client);
    } catch (err: any) {
      this.logWarningOnce(
        `[LOG: REDIS] Operation failed. Using fallback cache. Cause: ${err?.message ?? err}`,
      );
      return fallback();
    }
  }

  // Save a value to Redis
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    await this.withRedisFallback(
      async (redis) => {
        if (expirySeconds) {
          await redis.set(key, value, 'EX', expirySeconds);
        } else {
          await redis.set(key, value);
        }
      },
      () => {
        this.setFallback(key, value, expirySeconds);
      },
    );
  }

  // Get a value from Redis
  async get(key: string): Promise<string | null> {
    return this.withRedisFallback(
      async (redis) => redis.get(key),
      () => this.getFallback(key),
    );
  }

  // Delete a key from Redis
  async delete(key: string): Promise<number> {
    return this.withRedisFallback(
      async (redis) => redis.del(key),
      () => this.deleteFallback(key),
    );
  }

  // Set with JSON value (convenience method)
  async setJson(
    key: string,
    value: any,
    expirySeconds?: number,
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), expirySeconds);
  }

  // Get and parse JSON value (convenience method)
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  // Clean up Redis connection when app shuts down
  onModuleDestroy() {
    clearInterval(this.fallbackGcInterval);
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}
