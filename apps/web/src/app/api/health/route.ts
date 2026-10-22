/** Liveness probe for the container health check (docker-compose.production.yml).
 *  Answers from the web process alone: it does not call the CMS, so a CMS
 *  restart never marks the web container unhealthy. */
export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
