import i18next from 'i18next';
import Constants from './constants';
import Utils from './utils';
import config from '../config';
import { ERROR_TYPES } from '../common/feedback/utils';
import * as NativeMethods from './native-methods';
import { alert, fullScreen } from '../common/feedback';

const { ROUTER_PATHS } = Constants;

const ERROR_MAPPING = {
  40000: {
    buttonText: 'Common:TryAgain',
  },
  40001: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    buttonText: 'Common:Continue',
  },
  40002: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    buttonText: 'Common:Continue',
  },
  40003: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    buttonText: 'Common:Continue',
  },
  40004: {
    type: ERROR_TYPES.FULL_SCREEN,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    buttonText: 'Common:BackToHome',
  },
  40005: {
    type: ERROR_TYPES.FULL_SCREEN,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    buttonText: 'Common:BackToHome',
  },
  40008: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    buttonText: 'Common:Continue',
  },
  40009: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`;
    },
    buttonText: 'Common:Continue',
  },
  40011: {
    type: ERROR_TYPES.FULL_SCREEN,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    buttonText: 'Common:BackToHome',
  },
  40012: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    buttonText: 'Common:Continue',
  },
  40013: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`;
    },
    buttonText: 'Common:Continue',
  },
  40015: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    buttonText: 'Common:Continue',
  },
  40016: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    buttonText: 'Common:Continue',
  },
  40017: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    buttonText: 'Common:Continue',
  },
  40018: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    buttonText: 'Common:Continue',
  },
  40019: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    buttonText: 'Common:Continue',
  },
  40020: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    buttonText: 'Common:Continue',
  },
  40022: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    buttonText: 'Common:Continue',
  },
  40024: {
    buttonText: 'Common:Dismiss',
  },
  40025: {
    buttonText: 'Common:Continue',
  },
  40026: {
    buttonText: 'Common:Continue',
  },
  41000: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    buttonText: 'Common:Continue',
  },
  41014: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`;
    },
    buttonText: 'Common:Reorder',
  },
  54012: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
  },
  54013: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
  },
  57008: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    buttonText: 'Common:Continue',
  },
  57009: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`;
    },
  },
  57010: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    buttonText: 'Common:Continue',
  },
  57011: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_PAYMENT}`;
    },
  },
  57013: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.CONTACT_DETAIL}`;
    },
  },
};

export const errorAction = (code, customizeContent, commonOptions, callback) => {
  const content = customizeContent || i18next.t(`ApiError:${code}Description`);
  const {
    title: optionTitle,
    closeButtonContent: optionCloseButtonContent,
    onClose: optionCloseFunction,
    resetOptions,
  } = commonOptions;
  const options = {
    title: optionTitle || i18next.t(`ApiError:${code}Title`),
    closeButtonContent: ERROR_MAPPING[code] ? i18next.t(ERROR_MAPPING[code].buttonText) : optionCloseButtonContent,
    onClose: async () => {
      if (typeof optionCloseFunction === 'function') {
        await optionCloseButtonContent();
      }

      if (ERROR_MAPPING[code]) {
        ERROR_MAPPING[code].onClose();
      }
    },
    ...resetOptions,
  };

  switch (ERROR_MAPPING[code].type) {
    case ERROR_TYPES.FULL_SCREEN:
      fullScreen(content, options).then(callback);
      break;
    default:
      alert(content, options).then(callback);
      break;
  }
};
