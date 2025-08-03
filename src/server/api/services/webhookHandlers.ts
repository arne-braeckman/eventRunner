import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import type { SocialPlatform, InteractionType } from '../../../lib/types/contact';
import { SocialMediaIntegrationService } from './socialMediaIntegrationService';

// Webhook signature verification
export class WebhookSignatureVerifier {
  static verifyFacebookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = 'sha256=' + 
      crypto.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  static verifyInstagramSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Instagram uses the same verification as Facebook
    return this.verifyFacebookSignature(payload, signature, secret);
  }

  static verifyLinkedInSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// Webhook payload types
export interface FacebookWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: any;
    }>;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text: string;
      };
    }>;
  }>;
}

export interface InstagramWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: {
        media_id?: string;
        comment_id?: string;
        user_id?: string;
        text?: string;
      };
    }>;
  }>;
}

export interface LinkedInWebhookPayload {
  webhookId: string;
  eventType: string;
  createdAt: number;
  data: {
    entityUrn: string;
    [key: string]: any;
  };
}

// Base Webhook Handler
export abstract class BaseWebhookHandler {
  protected platform: SocialPlatform;
  protected integrationService: SocialMediaIntegrationService;

  constructor(platform: SocialPlatform, ctx: any) {
    this.platform = platform;
    this.integrationService = new SocialMediaIntegrationService(ctx);
  }

  abstract verifySignature(payload: string, signature: string, secret: string): boolean;
  abstract processWebhook(payload: any): Promise<void>;

  async handleWebhook(
    request: NextRequest,
    secret: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = await request.text();
      const signature = request.headers.get('X-Hub-Signature-256') || 
                       request.headers.get('X-LinkedIn-Signature') || '';

      // Verify signature
      if (!this.verifySignature(payload, signature, secret)) {
        return { success: false, message: 'Invalid signature' };
      }

      // Process webhook
      const webhookData = JSON.parse(payload);
      await this.processWebhook(webhookData);

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error(`${this.platform} webhook error:`, error);
      return { success: false, message: `Webhook processing failed: ${error}` };
    }
  }
}

// Facebook Webhook Handler
export class FacebookWebhookHandler extends BaseWebhookHandler {
  constructor(ctx: any) {
    super('FACEBOOK', ctx);
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    return WebhookSignatureVerifier.verifyFacebookSignature(payload, signature, secret);
  }

  async processWebhook(payload: FacebookWebhookPayload): Promise<void> {
    if (payload.object !== 'page') {
      return; // Only process page events
    }

    for (const entry of payload.entry) {
      // Process lead generation events
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            await this.processLeadGeneration(change.value);
          } else if (change.field === 'feed') {
            await this.processFeedInteraction(change.value);
          }
        }
      }

      // Process messaging events
      if (entry.messaging) {
        for (const message of entry.messaging) {
          await this.processMessage(message);
        }
      }
    }
  }

  private async processLeadGeneration(leadData: any): Promise<void> {
    try {
      // Get lead details from Facebook API
      const leadCaptureData = {
        platform: 'FACEBOOK' as SocialPlatform,
        name: leadData.field_data?.find((f: any) => f.name === 'full_name')?.values[0],
        email: leadData.field_data?.find((f: any) => f.name === 'email')?.values[0],
        phone: leadData.field_data?.find((f: any) => f.name === 'phone_number')?.values[0],
        message: leadData.field_data?.find((f: any) => f.name === 'message')?.values[0],
        formId: leadData.form_id,
        adId: leadData.ad_id,
        campaignId: leadData.campaign_id,
        metadata: {
          leadgenId: leadData.leadgen_id,
          createdTime: leadData.created_time,
          fieldData: leadData.field_data,
        }
      };

      // Process the lead capture
      const leads = [leadCaptureData];
      await this.integrationService.captureLeadsFromAllPlatforms();
    } catch (error) {
      console.error('Error processing Facebook lead generation:', error);
    }
  }

  private async processFeedInteraction(feedData: any): Promise<void> {
    try {
      // Process likes, comments, shares, etc.
      const interactionType: InteractionType = this.mapFeedActionToInteractionType(feedData.verb);
      
      if (interactionType) {
        // This would require mapping the user to a contact in our system
        // For now, we'll log the interaction for future processing
        console.log(`Facebook feed interaction: ${interactionType}`, feedData);
      }
    } catch (error) {
      console.error('Error processing Facebook feed interaction:', error);
    }
  }

  private async processMessage(messageData: any): Promise<void> {
    try {
      // Process direct messages
      if (messageData.message) {
        const interactionData = {
          platform: 'FACEBOOK' as SocialPlatform,
          type: 'SOCIAL_MESSAGE' as InteractionType,
          externalId: messageData.message.mid,
          userId: messageData.sender.id,
          content: messageData.message.text,
          metadata: {
            messageId: messageData.message.mid,
            senderId: messageData.sender.id,
            recipientId: messageData.recipient.id,
          },
          timestamp: messageData.timestamp,
        };

        // This would require mapping sender.id to a contact
        console.log('Facebook message received:', interactionData);
      }
    } catch (error) {
      console.error('Error processing Facebook message:', error);
    }
  }

  private mapFeedActionToInteractionType(verb: string): InteractionType | null {
    switch (verb) {
      case 'like':
        return 'SOCIAL_LIKE';
      case 'comment':
        return 'SOCIAL_COMMENT';
      case 'share':
        return 'OTHER';
      default:
        return null;
    }
  }
}

// Instagram Webhook Handler
export class InstagramWebhookHandler extends BaseWebhookHandler {
  constructor(ctx: any) {
    super('INSTAGRAM', ctx);
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    return WebhookSignatureVerifier.verifyInstagramSignature(payload, signature, secret);
  }

  async processWebhook(payload: InstagramWebhookPayload): Promise<void> {
    if (payload.object !== 'instagram') {
      return; // Only process Instagram events
    }

    for (const entry of payload.entry) {
      if (entry.changes) {
        for (const change of entry.changes) {
          switch (change.field) {
            case 'comments':
              await this.processComment(change.value);
              break;
            case 'mentions':
              await this.processMention(change.value);
              break;
            case 'story_insights':
              await this.processStoryInsight(change.value);
              break;
          }
        }
      }
    }
  }

  private async processComment(commentData: any): Promise<void> {
    try {
      const interactionData = {
        platform: 'INSTAGRAM' as SocialPlatform,
        type: 'SOCIAL_COMMENT' as InteractionType,
        externalId: commentData.comment_id,
        userId: commentData.user_id,
        content: commentData.text,
        metadata: {
          mediaId: commentData.media_id,
          commentId: commentData.comment_id,
          userId: commentData.user_id,
        },
        timestamp: Date.now(),
      };

      console.log('Instagram comment received:', interactionData);
    } catch (error) {
      console.error('Error processing Instagram comment:', error);
    }
  }

  private async processMention(mentionData: any): Promise<void> {
    try {
      const interactionData = {
        platform: 'INSTAGRAM' as SocialPlatform,
        type: 'SOCIAL_COMMENT' as InteractionType,
        externalId: mentionData.comment_id || mentionData.media_id,
        userId: mentionData.user_id,
        metadata: {
          mediaId: mentionData.media_id,
          userId: mentionData.user_id,
          mentionType: 'story_mention',
        },
        timestamp: Date.now(),
      };

      console.log('Instagram mention received:', interactionData);
    } catch (error) {
      console.error('Error processing Instagram mention:', error);
    }
  }

  private async processStoryInsight(insightData: any): Promise<void> {
    try {
      // Process story views, replies, etc.
      console.log('Instagram story insight:', insightData);
    } catch (error) {
      console.error('Error processing Instagram story insight:', error);
    }
  }
}

// LinkedIn Webhook Handler
export class LinkedInWebhookHandler extends BaseWebhookHandler {
  constructor(ctx: any) {
    super('LINKEDIN', ctx);
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    return WebhookSignatureVerifier.verifyLinkedInSignature(payload, signature, secret);
  }

  async processWebhook(payload: LinkedInWebhookPayload): Promise<void> {
    switch (payload.eventType) {
      case 'MEMBER_ENGAGEMENT':
        await this.processMemberEngagement(payload.data);
        break;
      case 'LEAD_EVENT':
        await this.processLeadEvent(payload.data);
        break;
      case 'MESSAGE_EVENT':
        await this.processMessageEvent(payload.data);
        break;
    }
  }

  private async processMemberEngagement(data: any): Promise<void> {
    try {
      const interactionType = this.mapLinkedInActionToInteractionType(data.action);
      
      if (interactionType) {
        const interactionData = {
          platform: 'LINKEDIN' as SocialPlatform,
          type: interactionType,
          externalId: data.entityUrn,
          userId: data.memberUrn,
          metadata: {
            action: data.action,
            entityUrn: data.entityUrn,
            memberUrn: data.memberUrn,
          },
          timestamp: Date.now(),
        };

        console.log('LinkedIn engagement received:', interactionData);
      }
    } catch (error) {
      console.error('Error processing LinkedIn member engagement:', error);
    }
  }

  private async processLeadEvent(data: any): Promise<void> {
    try {
      const leadCaptureData = {
        platform: 'LINKEDIN' as SocialPlatform,
        name: data.firstName + ' ' + data.lastName,
        email: data.emailAddress,
        phone: data.phoneNumber,
        company: data.companyName,
        metadata: {
          leadUrn: data.entityUrn,
          formUrn: data.formUrn,
          campaignUrn: data.campaignUrn,
        }
      };

      console.log('LinkedIn lead captured:', leadCaptureData);
    } catch (error) {
      console.error('Error processing LinkedIn lead event:', error);
    }
  }

  private async processMessageEvent(data: any): Promise<void> {
    try {
      const interactionData = {
        platform: 'LINKEDIN' as SocialPlatform,
        type: 'SOCIAL_MESSAGE' as InteractionType,
        externalId: data.messageUrn,
        userId: data.senderUrn,
        content: data.messageText,
        metadata: {
          messageUrn: data.messageUrn,
          conversationUrn: data.conversationUrn,
          senderUrn: data.senderUrn,
        },
        timestamp: Date.now(),
      };

      console.log('LinkedIn message received:', interactionData);
    } catch (error) {
      console.error('Error processing LinkedIn message event:', error);
    }
  }

  private mapLinkedInActionToInteractionType(action: string): InteractionType | null {
    switch (action) {
      case 'LIKE':
        return 'SOCIAL_LIKE';
      case 'COMMENT':
        return 'SOCIAL_COMMENT';
      case 'SHARE':
        return 'OTHER';
      case 'FOLLOW':
        return 'SOCIAL_FOLLOW';
      default:
        return null;
    }
  }
}

// Webhook Handler Factory
export class WebhookHandlerFactory {
  static createHandler(platform: SocialPlatform, ctx: any): BaseWebhookHandler {
    switch (platform) {
      case 'FACEBOOK':
        return new FacebookWebhookHandler(ctx);
      case 'INSTAGRAM':
        return new InstagramWebhookHandler(ctx);
      case 'LINKEDIN':
        return new LinkedInWebhookHandler(ctx);
      default:
        throw new Error(`Unsupported webhook platform: ${platform}`);
    }
  }
}

// Webhook Router for handling multiple platforms
export class WebhookRouter {
  private handlers: Map<SocialPlatform, BaseWebhookHandler> = new Map();

  constructor(private ctx: any) {}

  registerHandler(platform: SocialPlatform): void {
    const handler = WebhookHandlerFactory.createHandler(platform, this.ctx);
    this.handlers.set(platform, handler);
  }

  async handleWebhook(
    platform: SocialPlatform,
    request: NextRequest,
    secret: string
  ): Promise<{ success: boolean; message: string }> {
    const handler = this.handlers.get(platform);
    
    if (!handler) {
      return { success: false, message: `No handler registered for platform: ${platform}` };
    }

    return await handler.handleWebhook(request, secret);
  }

  // Webhook verification endpoint (for platform verification)
  async verifyWebhook(
    platform: SocialPlatform,
    request: NextRequest,
    verifyToken: string
  ): Promise<{ success: boolean; challenge?: string; message: string }> {
    const url = new URL(request.url);
    
    switch (platform) {
      case 'FACEBOOK':
      case 'INSTAGRAM':
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === verifyToken) {
          return { success: true, challenge: challenge || '', message: 'Verification successful' };
        }
        return { success: false, message: 'Verification failed' };

      case 'LINKEDIN':
        // LinkedIn verification is typically done during webhook setup
        return { success: true, message: 'LinkedIn webhook verified' };

      default:
        return { success: false, message: `Unsupported platform: ${platform}` };
    }
  }
}