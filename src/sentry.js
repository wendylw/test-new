import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';
// import { Integrations as ApmIntegrations } from '@sentry/apm';

Sentry.init({
  dsn: 'https://be399ca403c14a7ba5c785d60ac1716c@o420511.ingest.sentry.io/5338848',
  ignoreErrors: [],
  integrations: [new CaptureConsole({ levels: ['error', 'warn', 'assert'] })],
  attachStacktrace: true,
});

export { captureEvent, captureException, captureMessage } from '@sentry/react';
