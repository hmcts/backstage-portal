# Microsoft Authentication Setup

This document explains how to configure Microsoft authentication for the HMCTS Backstage portal based on the [official Backstage documentation](https://backstage.io/docs/auth/microsoft/provider/#configure-app-registration-on-azure).

## Azure AD App Registration Setup

### 1. Create App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Fill in the details:
   - **Name**: `HMCTS Backstage Portal`
   - **Supported account types**: Accounts in this organizational directory only (Single tenant)
   - **Redirect URI**: Web → `http://localhost:7007/api/auth/microsoft/handler/frame`

### 2. Configure Redirect URIs

After creating the app registration:

1. Go to Authentication → Redirect URIs
2. Add the development redirect URI:
   - **Development**: `http://localhost:7007/api/auth/microsoft/handler/frame`

### 3. Generate Client Secret

1. Go to Certificates & secrets → Client secrets
2. Click "New client secret"
3. Add description: `Backstage Authentication`
4. Set expiration (recommended: 24 months)
5. Copy the secret value - you'll need this for `AUTH_MICROSOFT_CLIENT_SECRET`

### 4. Configure API Permissions

For basic authentication and user sync, grant these Microsoft Graph permissions:

1. Go to API permissions → Add a permission → Microsoft Graph → Delegated permissions
2. Add these permissions:
   - `User.Read` - Sign in and read user profile (required for authentication)
   - `User.Read.All` - Read all users' basic profiles (for Microsoft Graph catalog provider)
   - `Group.Read.All` - Read all groups (for Microsoft Graph catalog provider)

3. Click "Grant admin consent" for your organization

### 5. Get Required Information

From your app registration, collect these values for environment variables:

- **Application (client) ID** → `AUTH_MICROSOFT_CLIENT_ID`
- **Directory (tenant) ID** → `AUTH_MICROSOFT_TENANT_ID`
- **Client secret value** → `AUTH_MICROSOFT_CLIENT_SECRET`

## Environment Configuration

Set these environment variables for development:

```bash
# Required for Microsoft authentication
AUTH_MICROSOFT_CLIENT_ID=your-application-client-id
AUTH_MICROSOFT_CLIENT_SECRET=your-client-secret-value
AUTH_MICROSOFT_TENANT_ID=your-tenant-id
```

## Current Backstage Configuration

The Backstage development configuration includes:

### Authentication Provider

```yaml
auth:
  providers:
    microsoft:
      development:
        clientId: ${AUTH_MICROSOFT_CLIENT_ID}
        clientSecret: ${AUTH_MICROSOFT_CLIENT_SECRET}
        tenantId: ${AUTH_MICROSOFT_TENANT_ID}
        domainHint: ${AUTH_MICROSOFT_TENANT_ID}
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
```

### Sign-in Resolvers

The configuration uses two resolvers to match authenticated users to catalog entities:

1. **emailMatchingUserEntityProfileEmail**: Matches the user's email address to a User entity's `spec.profile.email` field
2. **emailLocalPartMatchingUserEntityName**: Matches the local part of the email (before @) to a User entity's `metadata.name` field

### Microsoft Graph Catalog Provider

The configuration also includes the Microsoft Graph catalog provider to automatically sync users and groups from Azure AD:

```yaml
catalog:
  providers:
    microsoftGraphOrg:
      default:
        target: https://graph.microsoft.com/v1.0
        tenantId: ${AUTH_MICROSOFT_TENANT_ID}
        clientId: ${AUTH_MICROSOFT_CLIENT_ID}
        clientSecret: ${AUTH_MICROSOFT_CLIENT_SECRET}
```

This will automatically create User and Group entities in the Backstage catalog from your Azure AD.

## Troubleshooting

### Sign-in Resolver Errors

If you see "Failed to sign-in, unable to resolve user identity", the issue is that there are no User entities in the catalog for the sign-in resolvers to match against.

**Solution**: The Microsoft Graph catalog provider is configured to automatically sync User and Group entities from Azure AD. This requires:

1. **Proper API permissions** (see section 4 above)
2. **Admin consent** granted for the permissions
3. **Environment variables** properly set

The Microsoft Graph provider will:
- Sync all users from your Azure AD tenant as User entities
- Sync all groups from your Azure AD tenant as Group entities
- Run every hour to keep entities up to date

Once users are synced, the sign-in resolvers will be able to match authenticated Microsoft users to catalog entities:
- `emailMatchingUserEntityProfileEmail`: Matches user's email to `spec.profile.email`
- `emailLocalPartMatchingUserEntityName`: Matches email local part to `metadata.name`

### Initial Sync

After configuring the environment variables and starting Backstage:

1. The Microsoft Graph provider will run its first sync within an hour
2. You can check the logs for sync status
3. User entities will appear in the catalog under "Users"
4. Microsoft authentication should then work correctly

### Manual User Entity Creation (Development Only)

For immediate testing, you can temporarily add User entities to `examples/org.yaml` and include it in catalog locations:

```yaml
# In app-config.yaml under catalog.locations:
- type: file
  target: ../../examples/org.yaml
  rules:
    - allow: [User, Group]
```

However, the Microsoft Graph provider is the recommended approach for production use.

### API Permission Issues

If the Microsoft Graph catalog provider fails to sync users:

1. Verify API permissions are granted with admin consent
2. Check that the client secret hasn't expired
3. Ensure the service account has appropriate permissions to read users and groups

## Security Considerations

- Store secrets securely using environment variables or key vaults
- Regularly rotate client secrets
- Use the principle of least privilege for API permissions
- Consider using certificate-based authentication for production