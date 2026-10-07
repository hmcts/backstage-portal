import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'health',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        logger: coreServices.logger,
        rootHttpRouter: coreServices.rootHttpRouter,
      },
      async init({ auth, catalog, logger, rootHttpRouter }) {
        rootHttpRouter.use('/health/catalog', async (_request, response) => {
          try {
            const credentials = await auth.getOwnServiceCredentials();
            await catalog.queryEntities(
              { limit: 1 },
              { credentials },
            );
            response.status(200).json({ status: 'ok' });
          } catch (error) {
            logger.warn(
              'Catalog health check failed',
              error instanceof Error ? error : { error: String(error) },
            );
            response.status(503).json({ status: 'error' });
          }
        });
      },
    });
  },
});
