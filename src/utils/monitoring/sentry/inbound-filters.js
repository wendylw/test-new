// TIPS: reference source code: https://github.com/getsentry/sentry-javascript/blob/2d80b4b2cfabb69f0cfd4a96ea637a8cabbd37cb/packages/core/src/integrations/inboundfilters.ts#L94
// we want to implement the allowUrl feature provided by Sentry. but the original feature is not flexible. before drop the event we want to send the event to kibana, so we have to implement this feature by our self in the shouldFilter API
import { getEventDescription, logger } from '@sentry/utils';
import { getIsDebugMode } from '../utils';
import { getEventFilterUrl } from './utils';
import isAllowedUrl from './allowed-urls';
import isIgnoredError from './ignored-errors';

export function shouldFilterEvent(event, hints) {
  if (isIgnoredError(event, hints)) {
    getIsDebugMode() &&
      logger.warn(
        `Event filtered due to not being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`
      );
    return true;
  }
  return false;
}

export function shouldDropEvent(event, options) {
  if (!isAllowedUrl(event, options.allowUrls)) {
    getIsDebugMode() &&
      logger.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(
          event
        )}.\nUrl: ${getEventFilterUrl(event)}`
      );
    return true;
  }

  return false;
}
