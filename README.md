# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn start
```

## Authentication

This Backstage instance is configured with Microsoft authentication. For setup instructions, see:

- [Microsoft Authentication Setup](./docs/microsoft-auth-setup.md)


To limit the integrations with 3rd party services you can comment out the following sections of `app-config.yaml` as they require connection details which are unnecessary for local development (unless you are specifically working on a plugin that uses them).

```yaml
jenkins:
  instances:
    - name: cft
      baseUrl: ${JENKINS_CFT_URL}
      username: ${JENKINS_CFT_USERNAME}
      apiKey: ${JENKINS_CFT_API_KEY}
```

```yaml
integrations:
  github:
    # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
    # about setting up the GitHub integration here: https://backstage.io/docs/integrations/github/github-apps/#including-in-integrations-config
    - host: github.com
      apps:
        - $include: github-app-backstage-hmcts-credentials.yaml

```