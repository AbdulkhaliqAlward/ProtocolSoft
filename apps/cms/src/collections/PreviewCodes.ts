/**
 * Preview codes (Phase 2 §6.7): one-time, ≤15-minute, asymmetrically-signed codes.
 * The jti is stored HASHED (at rest) with single-use state. System-written only;
 * exchange marks codes used atomically. Nothing here is ever public.
 */
import type { CollectionConfig } from 'payload';

import { systemWriteOnly } from '../access/roles.js';

export const PreviewCodes: CollectionConfig = {
  slug: 'preview-codes',
  admin: {
    hidden: true, // never shown in the admin UI
    group: 'النظام / System',
  },
  access: {
    create: systemWriteOnly,
    read: systemWriteOnly, // readable only via Local API inside the exchange flow
    update: systemWriteOnly,
    delete: systemWriteOnly, // expiry sweep job only
  },
  fields: [
    { name: 'jtiHash', type: 'text', required: true, index: true, unique: true },
    { name: 'collection', type: 'text', required: true },
    { name: 'docId', type: 'text', required: true },
    { name: 'locale', type: 'text', required: true },
    { name: 'revisionId', type: 'text' },
    { name: 'issuingAdminId', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true, index: true },
    { name: 'used', type: 'checkbox', required: true, defaultValue: false, index: true },
    { name: 'usedAt', type: 'date' },
  ],
  timestamps: false,
};
