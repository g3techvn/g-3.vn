type CacheItem = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheItem>();

export const cacheData = {
  set: (key: string, data: any, expirationInSeconds: number = 300) => {
    cache.set(key, {
      data,
      timestamp: Date.now() + (expirationInSeconds * 1000)
    });
  },

  get: (key: string): any | null => {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      cache.delete(key);
      return null;
    }

    return item.data;
  },

  clear: (key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }
};

// Tự động clear cache cũ mỗi giờ
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.timestamp) {
      cache.delete(key);
    }
  }
}, 3600000); // 1 giờ