import { NextResponse } from "next/server";

/**
 * Documentation endpoint for the PHP data-sync microservice.
 *
 * There is no PHP process running behind this route: it publishes the response
 * *contract* that `backend/php/sync_service.php` implements, so the shape can be
 * inspected without standing up the service. Every value below is an example,
 * not a live reading.
 */
export async function GET() {
  return NextResponse.json({
    kind: "api-contract-example",
    service: "PHP Data Sync REST API",
    disclaimer:
      "Example payload only — this Next.js route documents the contract; it does not proxy or monitor a running PHP service.",
    implementation: {
      runtime: "PHP 8.2 CLI",
      database: "MySQL via PDO prepared statements",
      transport: "cURL HTTP/1.1",
      scheduling: "Linux crontab (see backend/php/cron_sync.php)",
      suggestedCron: "0 */2 * * *",
    },
    exampleResponse: {
      status: "OK",
      source: "https://api.publicdata.gov/v1/spatial-records",
      recordsSynced: 1420,
      syncDurationMs: 38,
      httpStatus: 200,
      completedAt: "2026-07-26T02:00:00.000Z",
    },
    errorContract: {
      status: "ERROR",
      stage: "curl | decode | persist",
      message: "Human-readable failure reason written to STDERR and the sync log.",
      exitCode: 1,
    },
  });
}
