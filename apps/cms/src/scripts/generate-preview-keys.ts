/** Generates the Ed25519 preview key pair (server-side provisioning aid).
 *  Private key -> cms env (PREVIEW_SIGNING_PRIVATE_KEY) ONLY.
 *  Public key  -> web env (PREVIEW_VERIFY_PUBLIC_KEY).
 *  Never committed to Git. */
import { generateKeyPairPem } from '../utilities/preview-signing.js';

const { privateKeyPem, publicKeyPem } = generateKeyPairPem();
console.log('=== PREVIEW_SIGNING_PRIVATE_KEY (apps/cms env ONLY) ===');
console.log(privateKeyPem);
console.log('=== PREVIEW_VERIFY_PUBLIC_KEY (apps/web env ONLY) ===');
console.log(publicKeyPem);
