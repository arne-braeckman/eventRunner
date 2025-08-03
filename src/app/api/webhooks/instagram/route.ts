import { NextRequest, NextResponse } from 'next/server';
import { WebhookRouter } from '../../../../server/api/services/webhookHandlers';

const webhookRouter = new WebhookRouter({
  // This would typically be a Convex context or database context
  // For now, we'll use a mock context
  db: null,
});

// Initialize Instagram webhook handler
webhookRouter.registerHandler('INSTAGRAM');

export async function GET(request: NextRequest) {
  try {
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
    
    if (!verifyToken) {
      return NextResponse.json(
        { error: 'Instagram webhook verify token not configured' },
        { status: 500 }
      );
    }

    const result = await webhookRouter.verifyWebhook('INSTAGRAM', request, verifyToken);
    
    if (result.success && result.challenge) {
      return new NextResponse(result.challenge, { status: 200 });
    }
    
    return NextResponse.json(
      { error: result.message },
      { status: 403 }
    );
  } catch (error) {
    console.error('Instagram webhook verification error:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.INSTAGRAM_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Instagram webhook secret not configured' },
        { status: 500 }
      );
    }

    const result = await webhookRouter.handleWebhook('INSTAGRAM', request, webhookSecret);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    
    return NextResponse.json(
      { error: result.message },
      { status: 400 }
    );
  } catch (error) {
    console.error('Instagram webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}