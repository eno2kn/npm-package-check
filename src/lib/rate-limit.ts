import { LRUCache } from 'lru-cache';

export type RateLimitConfig = {
  /** 各intervalごとで何人のユーザーを許容するか */
  max: number;
  /** intervalの時間（ミリ秒） */
  ttl: number;
  /** interval中何回まで */
  limit: number;
};

export type RateLimitResponse = {
  success: boolean;
  limit: number;
  remaining: number;
};

export class RateLimit {
  private cache: LRUCache<string, number>;
  private limitCount: number;

  constructor({ max, ttl, limit }: RateLimitConfig) {
    this.cache = new LRUCache<string, number>({
      max,
      ttl,
    });
    this.limitCount = limit;
  }

  limit(token: string): Promise<RateLimitResponse> {
    return new Promise((resolve) => {
      const tokenCount = this.cache.get(token) || 0;
      const currentUsage = tokenCount + 1;
      this.cache.set(token, currentUsage);
      const isRateLimited = currentUsage > this.limitCount;

      return resolve({
        success: !isRateLimited,
        limit: this.limitCount,
        remaining: isRateLimited ? 0 : this.limitCount - currentUsage,
      });
    });
  }
}
