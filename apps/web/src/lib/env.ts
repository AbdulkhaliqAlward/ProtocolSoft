/** Central env access — keeps secret usage greppable for verify:no-db audits. */
export const internalCmsUrl = (): string => process.env.CMS_INTERNAL_URL ?? 'http://localhost:3001';
