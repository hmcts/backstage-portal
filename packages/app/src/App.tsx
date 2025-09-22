import { Route } from 'react-router-dom';

import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  techdocsPlugin,
} from '@backstage/plugin-techdocs';
import techDocsPlugin from '@backstage/plugin-techdocs/alpha';
import { techDocsMermaidAddonModule } from 'backstage-plugin-techdocs-addon-mermaid';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { HomepageCompositionRoot, VisitListener } from '@backstage/plugin-home';
import { HomePage } from './components/home/HomePage';
import jenkinsPlugin from '@backstage-community/plugin-jenkins/alpha';
import { apis } from './apis';

import {
  createFrontendModule,
  SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInProviderConfig,
  SignInPage,
} from '@backstage/core-components';

import { createApp } from '@backstage/frontend-defaults';
import {
  convertLegacyAppRoot,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { NotificationsPage } from '@backstage/plugin-notifications';
import { SignalsDisplay } from '@backstage/plugin-signals';
import { microsoftAuthApiRef } from '@backstage/core-plugin-api';
import { TechRadarPage } from '@backstage-community/plugin-tech-radar';
import { techDocsReportIssueAddonModule } from '@backstage/plugin-techdocs-module-addons-contrib/alpha';

const microsoftAuthProvider: SignInProviderConfig = {
  id: 'microsoft-auth-provider',
  title: 'Microsoft',
  message: 'Sign in using Microsoft',
  apiRef: microsoftAuthApiRef,
};

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => (props) => (
      <SignInPage
        {...props}
        auto
        providers={[microsoftAuthProvider]}
      />
    ),
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<HomepageCompositionRoot />}>
      <HomePage />
    </Route>

    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route path="/catalog/:namespace/:kind/:name" element={<CatalogEntityPage />}>
      {entityPage}
    </Route>

    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />

    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />

    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>

    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/tech-radar" element={<TechRadarPage width={1500} height={800} />} />
  </FlatRoutes>
);

const legacyFeatures = convertLegacyAppRoot(
  <>
    <VisitListener />
    <AlertDisplay />
    <OAuthRequestDialog />
    <SignalsDisplay />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);

const backstageApp = createApp({
  features: [
    ...legacyFeatures,
    jenkinsPlugin,
    techDocsPlugin,
    techDocsMermaidAddonModule,
    techDocsReportIssueAddonModule,
    createFrontendModule({
      pluginId: 'app',
      extensions: [
          ...apis,
          signInPage,
      ],
    }),
  ],
  // bind legacy plugin externalRoutes to each other
  bindRoutes({ bind }) {
//     bind(convertLegacyRouteRefs(catalogPlugin.externalRoutes), {
//       createComponent: convertLegacyRouteRef(scaffolderPlugin.routes.root),
//       viewTechDoc: convertLegacyRouteRef(techdocsPlugin.routes.docRoot),
//       createFromTemplate: convertLegacyRouteRef(scaffolderPlugin.routes.selectedTemplate),
//     });

    bind(convertLegacyRouteRefs(apiDocsPlugin.externalRoutes), {
      registerApi: convertLegacyRouteRef(catalogImportPlugin.routes.importPage),
    });

    bind(convertLegacyRouteRefs(scaffolderPlugin.externalRoutes), {
      registerComponent: convertLegacyRouteRef(catalogImportPlugin.routes.importPage),
      viewTechDoc: convertLegacyRouteRef(techdocsPlugin.routes.docRoot),
    });

    bind(convertLegacyRouteRefs(orgPlugin.externalRoutes), {
      catalogIndex: convertLegacyRouteRef(catalogPlugin.routes.catalogIndex),
    });
  },
});

const AppComponent: React.FC = () => {
  return backstageApp.createRoot();
};

export default AppComponent;
