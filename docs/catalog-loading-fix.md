# Backstage Catalog Loading Fix

This document describes the fix for the Backstage catalog loading issue.

## Problem

The Backstage catalog was failing to load with the error:
- "Failed to load entity kinds"
- "Error: Could not fetch catalog entities"

## Root Cause

The catalog API was configured to require authentication, but the guest authentication provider was commented out in the configuration. This prevented the frontend from accessing the catalog API endpoints.

## Solution

1. **Enabled Guest Authentication**: Uncommented the `guest: {}` configuration in `app-config.yaml` to allow guest access for development.

2. **Fixed Database Configuration**: Added local development configuration with SQLite in-memory database to avoid PostgreSQL connection requirements during development.

3. **Proper Authentication Flow**: Ensured that the catalog API can be accessed with proper authentication tokens.

## Changes Made

### app-config.yaml
- Enabled guest authentication provider by uncommenting `guest: {}`
- Restored Microsoft Graph provider configuration for production use

### app-config.local.yaml
- Added local development configuration with SQLite database
- Configured guest authentication for development

## Verification

The catalog now successfully loads:
- ✅ Entity kinds are available (Component, Group, System, API, User, Template, Location)
- ✅ Components can be browsed and filtered
- ✅ Groups are properly displayed
- ✅ Systems are accessible
- ✅ Authentication works with guest provider

## Production Configuration

For production deployment, ensure:
1. Set proper environment variables:
   - `AUTH_MICROSOFT_CLIENT_ID`
   - `AUTH_MICROSOFT_CLIENT_SECRET` 
   - `AUTH_MICROSOFT_TENANT_ID`
   - Database connection variables (`POSTGRES_HOST`, `POSTGRES_PORT`, etc.)

2. The Microsoft Graph provider will automatically sync users and groups from Azure AD when proper credentials are provided.

## Testing

The fix has been verified by:
1. Starting the Backstage application locally
2. Signing in as a guest user
3. Navigating to the catalog
4. Confirming all entity types load correctly
5. Testing filtering and navigation functionality