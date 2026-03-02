// src/utils/redirect.ts - 安全重定向工具

// 仅允许站内路径，防止开放重定向
export function getSafeRedirect(raw: unknown, fallback = '/'): string {
  if (typeof raw !== 'string' || raw.length === 0) return fallback;

  let decoded = raw;
  try {
    if (raw.includes('%')) {
      decoded = decodeURIComponent(raw);
    }
  } catch {
    return fallback;
  }

  // 仅允许以 / 开头的站内路径，禁止 //、\\ 或协议跳转
  if (!decoded.startsWith('/')) return fallback;
  if (decoded.startsWith('//') || decoded.startsWith('/\\')) return fallback;
  if (decoded.includes('://')) return fallback;

  return decoded;
}
