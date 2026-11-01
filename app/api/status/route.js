import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Tells the login page whether the app has been configured (no secrets are revealed).
export async function GET() {
  return NextResponse.json({
    password: Boolean(process.env.APP_PASSWORD && process.env.AUTH_SECRET),
    storage: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID),
  });
}
