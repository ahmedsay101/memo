# Paymob Integration Setup Guide

This guide will help you set up Paymob payment integration for your restaurant application.

## Prerequisites

1. A Paymob account (sign up at https://accept.paymob.com)
2. Verified business account with Paymob
3. Access to your website's server environment

## Setup Steps

### 1. Paymob Dashboard Configuration

#### Create Integration
1. Log in to your Paymob dashboard
2. Go to **Developers > Integrations**
3. Create a new **Card Payment** integration
4. Note down the **Integration ID**

#### Get API Credentials
1. Go to **Developers > API Keys**
2. Copy your **API Key**
3. Copy your **HMAC Secret**

#### Configure Webhooks
1. Go to **Developers > Webhooks**
2. Add a new webhook with URL: `https://yourdomain.com/api/payments/paymob/webhook`
3. Select events: `Transaction Response`
4. Save the webhook

#### Configure Callback URLs
1. In your integration settings
2. Set **Success URL**: `https://yourdomain.com/payment-callback?success=true`
3. Set **Failure URL**: `https://yourdomain.com/payment-callback?success=false`
4. Set **Pending URL**: `https://yourdomain.com/payment-callback?success=pending`

### 2. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Paymob Configuration
PAYMOB_API_KEY=your_actual_api_key_here
PAYMOB_INTEGRATION_ID=your_actual_integration_id_here
PAYMOB_HMAC_SECRET=your_actual_hmac_secret_here
```

### 3. Install Dependencies

The integration uses built-in Node.js modules, so no additional packages are required.

### 4. Test the Integration

#### Test Mode
- Use Paymob's test card numbers:
  - **Successful Payment**: `4987654321098769`
  - **Failed Payment**: `4000000000000002`
  - **CVV**: Any 3 digits
  - **Expiry**: Any future date

#### Production Mode
- Ensure your Paymob account is fully verified
- Update environment variables with production credentials
- Test with real card numbers

## Features

### ✅ What's Included

- **Secure Card Payments**: Integration with Paymob's hosted payment page
- **Webhook Handling**: Automatic order confirmation on successful payment
- **Payment Status Tracking**: Real-time payment status updates
- **Error Handling**: Graceful handling of payment failures
- **Mobile Responsive**: Works on all devices
- **Arabic UI**: Full RTL support for Arabic interface

### 🔒 Security Features

- **HMAC Verification**: Webhook signature verification for security
- **SSL Encryption**: All communication encrypted
- **PCI Compliance**: Paymob handles card data securely
- **No Card Storage**: Card details never stored on your server

## Payment Flow

1. **Customer selects card payment** → Cart checkout page
2. **Order data preparation** → Customer and order information collected
3. **Paymob session creation** → API call to create payment session
4. **Redirect to payment page** → Customer redirected to secure Paymob page
5. **Payment processing** → Customer enters card details on Paymob
6. **Payment completion** → Paymob processes payment with bank
7. **Webhook notification** → Paymob notifies your server of payment result
8. **Customer redirect** → Customer redirected back to your site
9. **Order confirmation** → Order created in your system if payment successful

## Troubleshooting

### Common Issues

#### "Authentication failed"
- Check your API key is correct
- Ensure no extra spaces in environment variables

#### "Invalid integration ID"
- Verify integration ID from Paymob dashboard
- Make sure integration is active

#### "Webhook signature invalid"
- Check HMAC secret is correct
- Ensure webhook URL is accessible from internet

#### "Payment not completing"
- Check callback URLs are correctly configured
- Verify SSL certificate on your domain

### Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Webhook endpoint is accessible
- [ ] Callback URLs return 200 status
- [ ] Test payments work with test card numbers
- [ ] Order creation works after successful payment
- [ ] Email notifications are sent (if configured)

### Logs and Monitoring

Check the following for debugging:
- Browser console for frontend errors
- Server logs for API errors  
- Paymob dashboard for transaction status
- Webhook logs in Paymob dashboard

## Support

For integration support:
- **Paymob Documentation**: https://docs.paymob.com
- **Paymob Support**: support@paymob.com
- **Technical Issues**: Check server logs and Paymob dashboard

## Security Notes

🚨 **Important Security Guidelines**:

1. **Never expose API keys** in frontend code
2. **Always verify webhook signatures** 
3. **Use HTTPS only** in production
4. **Validate payment amounts** on server side
5. **Store minimal payment data** - let Paymob handle sensitive data
6. **Regular security audits** of payment flow

## Production Deployment

Before going live:

1. **Switch to production credentials** in Paymob dashboard
2. **Update environment variables** with production values
3. **Test with real small amounts** first
4. **Monitor webhook delivery** and order creation
5. **Set up proper logging** and error alerting
6. **Backup payment data** regularly

---

**Need help?** Contact your development team or refer to the Paymob documentation for additional support.