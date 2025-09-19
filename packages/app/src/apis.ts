import {
  ScmAuth,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';

import {
  errorApiRef,
  configApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { visitsApiRef, VisitsWebStorageApi } from '@backstage/plugin-home';

import { ApiBlueprint } from '@backstage/frontend-plugin-api';

const scmIntegrationsApi = ApiBlueprint.make({
  name: 'scm-integrations',
  params: define =>
    define({
      api: scmIntegrationsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
    }),
});

const scmAuthApi = ApiBlueprint.make({
  name: 'scm-auth',
  params: define => define(ScmAuth.createDefaultApiFactory()),
});

const visitsApi = ApiBlueprint.make({
  name: 'visits',
  params: define =>
    define({
      api: visitsApiRef,
      deps: {
        identityApi: identityApiRef,
        errorApi: errorApiRef,
      },
      factory: ({ identityApi, errorApi }) =>
        VisitsWebStorageApi.create({ identityApi, errorApi }),
    }),
});

export const apis = [
  scmIntegrationsApi,
  scmAuthApi,
  visitsApi,
];