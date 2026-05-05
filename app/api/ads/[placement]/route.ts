import { NextRequest, NextResponse } from 'next/server';
import { selectAdForPlacement, recordImpression } from '@/lib/db/ads';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placement: string }> },
) {
  const { placement } = await params;

  const validPositions = [
    'header',
    'sidebar',
    'in_feed',
    'between_articles',
    'sticky_footer',
    'article_top',
    'article_bottom',
    'homepage_hero',
    'category_top',
    'search_results',
  ];

  if (!validPositions.includes(placement)) {
    return NextResponse.json(
      { error: 'Invalid placement' },
      { status: 400 },
    );
  }

  const headersList = await headers();
  const pagePath = request.nextUrl.searchParams.get('path') ?? undefined;
  const categoryId = request.nextUrl.searchParams.get('category') ?? undefined;
  const sessionId = request.nextUrl.searchParams.get('session') ?? undefined;
  const userId = request.nextUrl.searchParams.get('user') ?? undefined;
  const ipHash = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? undefined;
  const userAgent = headersList.get('user-agent') ?? undefined;
  const referer = headersList.get('referer') ?? undefined;

  const result = await selectAdForPlacement({
    position: placement,
    pagePath,
    categoryId,
    sessionId,
    userId,
  });

  if (result.status === 'error') {
    return NextResponse.json(
      { error: result.message },
      { status: 500 },
    );
  }

  if (!result.data) {
    return NextResponse.json({ ad: null });
  }

  const ad = result.data;

  await recordImpression({
    adId: ad.id,
    sessionId,
    userId,
    ipHash,
    userAgent,
    referer,
    costAmount: ad.cost_per_impression,
  });

  return NextResponse.json({
    ad: {
      id: ad.id,
      name: ad.name,
      creative_format: ad.creative_format,
      headline: ad.headline,
      body_text: ad.body_text,
      call_to_action: ad.call_to_action,
      image_url: ad.image_url,
      video_url: ad.video_url,
      destination_url: ad.destination_url,
    },
  });
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
