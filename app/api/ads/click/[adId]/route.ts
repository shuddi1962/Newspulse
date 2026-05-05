import { NextRequest, NextResponse } from 'next/server';
import { recordClick, getCreativeById } from '@/lib/db/ads';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const { adId } = await params;

  const headersList = await headers();
  const sessionId = request.nextUrl.searchParams.get('session') ?? undefined;
  const userId = request.nextUrl.searchParams.get('user') ?? undefined;
  const ipHash = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? undefined;
  const userAgent = headersList.get('user-agent') ?? undefined;
  const referer = headersList.get('referer') ?? undefined;

  const creativeRes = await getCreativeById(adId);

  let costAmount = 0;
  let redirectUrl = '/';

  if (creativeRes.status === 'ok' && creativeRes.data) {
    redirectUrl = creativeRes.data.destination_url ?? '/';
  }

  await recordClick({
    adId,
    sessionId,
    userId,
    ipHash,
    userAgent,
    referer,
    costAmount,
  });

  return NextResponse.redirect(redirectUrl, 302);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
