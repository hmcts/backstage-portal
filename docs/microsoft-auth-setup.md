# Microsoft Authentication Setup

This document explains the Microsoft authentication configuration for the HMCTS Backstage portal.

## Overview

The Microsoft authentication provider allows users to sign in using their Microsoft/Azure AD accounts. This setup includes:

1. **Microsoft Authentication Provider**: Handles OAuth flow with Microsoft
2. **Microsoft Graph Catalog Provider**: Syncs users and groups from Azure AD
3. **Sign-in Resolvers**: Maps authenticated users to catalog entities

## Configuration

### Environment Variables Required

```bash
# Microsoft Authentication
AUTH_MICROSOFT_CLIENT_ID=your-client-id
AUTH_MICROSOFT_CLIENT_SECRET=your-client-secret
AUTH_MICROSOFT_TENANT_ID=your-tenant-id
```

### Azure AD Application Setup

1. Register a new application in Azure AD
2. Configure redirect URLs:
   - Development: `http://localhost:7007/api/auth/microsoft/handler/frame`
   - Production: `https://your-domain.com/api/auth/microsoft/handler/frame`
3. Generate client secret under "Certificates & secrets"
4. Grant required API permissions:
   - `User.Read` (for sign-in)
   - `Group.Read.All` (for group sync)
   - `User.Read.All` (for user sync)

### Sign-in Resolvers

The configuration includes three resolvers that attempt to match users in order:

1. **microsoftEmailMatchingUserEntityName**: Matches the full email as entity name
2. **microsoftEmailLocalPartMatchingUserEntityName**: Matches the local part (before @) as entity name  
3. **emailMatchingUserEntityProfileEmail**: Matches email against the user entity's profile email

### User Entity Examples

Users can be created in the catalog either:

1. **Automatically** via Microsoft Graph provider (recommended for production)
2. **Manually** via YAML files (good for testing)

Example user entity structure:

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: "john.doe"
  annotations:
    microsoft.com/email: "john.doe@yourdomain.com"
    microsoft.com/objectId: "azure-ad-object-id"
spec:
  profile:
    displayName: "John Doe"
    email: "john.doe@yourdomain.com"
  memberOf: [team-alpha, everyone]
```

## Troubleshooting

### "Failed to resolve user identity"

This error occurs when:
1. No user entity exists in the catalog matching the signed-in user
2. Sign-in resolvers are not configured
3. Microsoft Graph provider is not properly syncing users

**Solutions:**
1. Ensure Microsoft Graph provider has proper permissions
2. Check that users exist in the catalog with matching emails/names
3. Verify sign-in resolvers are configured correctly

### "Failed to load entity kinds"

This error typically indicates:
1. Catalog database connectivity issues
2. Permission policy problems
3. Missing entity providers

**Solutions:**
1. Check database connection
2. Verify catalog providers are running
3. Check backend logs for detailed errors

## Testing

To test the authentication setup:

1. Ensure environment variables are set
2. Run `yarn start` to start the development server
3. Navigate to `http://localhost:3000`
4. Click "Sign In" and select "Microsoft"
5. Complete OAuth flow
6. Verify user is properly identified in Backstage

## Production Deployment

For production deployment:

1. Use production Azure AD application
2. Set proper redirect URLs
3. Configure production environment variables
4. Enable Microsoft Graph provider for automatic user sync
5. Set up proper RBAC policies as needed