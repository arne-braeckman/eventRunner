# External APIs

## DocuSign API
- **Purpose:** E-signature capabilities for contracts and agreements
- **Documentation:** https://developers.docusign.com/
- **Base URL:** https://demo.docusign.net/restapi/v2.1
- **Authentication:** OAuth 2.0
- **Rate Limits:** 1000 requests/hour per integration
- **Key Endpoints Used:**
  - `POST /accounts/{accountId}/envelopes` - Send documents for signature
  - `GET /accounts/{accountId}/envelopes/{envelopeId}` - Check signature status
- **Integration Notes:** Webhook endpoints required for status updates

## Stripe API
- **Purpose:** Payment processing including Belgian payment methods
- **Documentation:** https://stripe.com/docs/api
- **Base URL:** https://api.stripe.com/v1
- **Authentication:** API Keys (publishable + secret)
- **Rate Limits:** 100 requests/second
- **Key Endpoints Used:**
  - `POST /payment_intents` - Create payment intent
  - `POST /customers` - Create customer records
  - `GET /payment_intents/{id}` - Retrieve payment status
- **Integration Notes:** Webhook endpoints for payment status updates, support for Bancontact and other EU payment methods

## Social Media APIs
- **Purpose:** Lead capture and engagement tracking from social platforms
- **Platforms:** Facebook Graph API, Instagram Basic Display API, LinkedIn API
- **Rate Limits:** Varies by platform (typically 200-600 requests/hour)
- **Integration Notes:** OAuth flows required, webhook subscriptions for real-time updates
