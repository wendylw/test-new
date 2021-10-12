import i18next from 'i18next';
import Constants from './constants';
import Utils from './utils';
import config from '../config';
import * as NativeMethods from './native-methods';
import { fullScreen } from '../common/feedback';

const { ROUTER_PATHS } = Constants;

export const ERROR_MAPPING = {
  40000: {
    closeButtonText: i18next.t('Common:TryAgain'),
  },
  40001: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40002: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40003: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40004: {
    api: fullScreen,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    closeButtonText: i18next.t('Common:BackToHome'),
  },
  40005: {
    api: fullScreen,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    closeButtonText: i18next.t('Common:BackToHome'),
  },
  40008: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40009: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40011: {
    api: fullScreen,
    onClose: () => {
      if (Utils.isWebview()) {
        NativeMethods.gotoHome();

        return;
      }
      window.location.href = config.beepitComUrl;
    },
    closeButtonText: i18next.t('Common:BackToHome'),
  },
  40012: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40013: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40015: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40016: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40017: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40018: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40019: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40020: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40022: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  40024: {
    closeButtonText: 'Common:Dismiss',
  },
  40025: {
    closeButtonText: i18next.t('Common:Continue'),
  },
  40026: {
    closeButtonText: i18next.t('Common:Continue'),
  },
  41000: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`;
    },
    closeButtonText: i18next.t('Common:Continue'),
  },
  41014: {
    onClose: () => {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`;
    },
    closeButtonText: i18next.t('Common:Reorder'),
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
    closeButtonText: i18next.t('Common:Continue'),
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
    closeButtonText: i18next.t('Common:Continue'),
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
