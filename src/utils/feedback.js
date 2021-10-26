import i18next from 'i18next';
import Constants from './constants';
import Utils from './utils';
import config from '../config';
import * as NativeMethods from './native-methods';
import { alert, fullScreen } from '../common/feedback';

const { ROUTER_PATHS } = Constants;

function getRedirectUrl(path, otherQueryString) {
  const h = Utils.getQueryString('h');
  const type = Utils.getQueryString('type');

  return `${window.location.origin}${path}?h=${h}&type=${type}${otherQueryString || ''}`;
}

export const ERROR_MAPPING = {
  401: options =>
    alert(i18next.t(`ApiError:401Description`), {
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`);
      },
      ...options,
    }),
  40000: options =>
    alert(i18next.t(`ApiError:40000Description`), {
      title: i18next.t(`ApiError:40000Title`),
      closeButtonContent: i18next.t('Common:TryAgain'),
      onClose: () => {
        window.location.reload();
      },
      ...options,
    }),
  40001: options =>
    alert(i18next.t(`ApiError:40001Description`), {
      title: i18next.t(`ApiError:40001Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`);
      },
      ...options,
    }),
  40002: options =>
    alert(i18next.t(`ApiError:40002Description`), {
      title: i18next.t(`ApiError:40002Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`);
      },
      ...options,
    }),
  40003: options =>
    alert(i18next.t(`ApiError:40003Description`), {
      title: i18next.t(`ApiError:40003Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`);
      },
      ...options,
    }),
  40004: options =>
    fullScreen(i18next.t(`ApiError:40004Description`), {
      title: i18next.t(`ApiError:40004Title`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        if (Utils.isWebview()) {
          NativeMethods.gotoHome();

          return;
        }
        window.location.href = config.beepitComUrl;
      },
      ...options,
    }),
  40005: options =>
    fullScreen(i18next.t(`ApiError:StoreNotFoundDescription`), {
      title: i18next.t(`ApiError:StoreNotFoundTitle`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        if (Utils.isWebview()) {
          NativeMethods.gotoHome();

          return;
        }
        window.location.href = config.beepitComUrl;
      },
      ...options,
    }),
  40006: options =>
    fullScreen(i18next.t(`ApiError:StoreNotFoundDescription`), {
      title: i18next.t(`ApiError:StoreNotFoundTitle`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        if (Utils.isWebview()) {
          NativeMethods.gotoHome();

          return;
        }
        window.location.href = config.beepitComUrl;
      },
      ...options,
    }),
  40007: options =>
    fullScreen(i18next.t(`ApiError:StoreNotFoundDescription`), {
      title: i18next.t(`ApiError:StoreNotFoundTitle`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        if (Utils.isWebview()) {
          NativeMethods.gotoHome();

          return;
        }
        window.location.href = config.beepitComUrl;
      },
      ...options,
    }),
  40008: options =>
    alert(i18next.t(`ApiError:40008Description`), {
      title: i18next.t(`ApiError:40008Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`);
      },
      ...options,
    }),
  40009: options =>
    alert(i18next.t(`ApiError:40009Description`), {
      title: i18next.t(`ApiError:40009Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`);
      },
      ...options,
    }),
  40010: options =>
    alert(i18next.t(`ApiError:40010Description`), {
      title: i18next.t(`ApiError:40010Title`),
      ...options,
    }),
  40011: options =>
    fullScreen(i18next.t(`ApiError:40011Description`), {
      title: i18next.t(`ApiError:40011Title`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        if (Utils.isWebview()) {
          NativeMethods.gotoHome();

          return;
        }
        window.location.href = config.beepitComUrl;
      },
      ...options,
    }),
  40012: options =>
    alert(i18next.t(`ApiError:40012Description`), {
      title: i18next.t(`ApiError:40012Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`);
      },
      ...options,
    }),
  40013: options =>
    alert(i18next.t(`ApiError:40013Description`), {
      title: i18next.t(`ApiError:40013Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`);
      },
      ...options,
    }),
  40015: options =>
    alert(i18next.t(`ApiError:40015Description`), {
      title: i18next.t(`ApiError:40015Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  40016: options =>
    alert(i18next.t(`ApiError:40016Description`), {
      title: i18next.t(`ApiError:40016Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`);
      },
      ...options,
    }),
  40017: options =>
    alert(i18next.t(`ApiError:40017Description`), {
      title: i18next.t(`ApiError:40017Title`),
      onClose: () => {
        const callbackUrl = encodeURIComponent(ROUTER_PATHS.ORDERING_HOME);

        window.location.href = getRedirectUrl(
          `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
          `&callbackUrl=${callbackUrl}`
        );
      },
      ...options,
    }),
  40018: options =>
    alert(i18next.t(`ApiError:40018Description`), {
      title: i18next.t(`ApiError:40018Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`);
      },
      ...options,
    }),
  40019: options =>
    alert(i18next.t(`ApiError:40019Description`), {
      title: i18next.t(`ApiError:40019Title`),
      onClose: () => {
        const callbackUrl = encodeURIComponent(ROUTER_PATHS.ORDERING_HOME);

        window.location.href = getRedirectUrl(
          `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
          `&callbackUrl=${callbackUrl}`
        );
      },
      ...options,
    }),
  40020: options =>
    alert(i18next.t(`ApiError:40020Description`), {
      title: i18next.t(`ApiError:40020Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  40022: options =>
    alert(i18next.t(`ApiError:40022Description`), {
      title: i18next.t(`ApiError:40022Title`),
      onClose: () => {
        const callbackUrl = encodeURIComponent(ROUTER_PATHS.ORDERING_HOME);

        window.location.href = getRedirectUrl(
          `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
          `&callbackUrl=${callbackUrl}`
        );
      },
      ...options,
    }),
  40024: options =>
    alert(i18next.t(`ApiError:40022Description`), {
      title: i18next.t(`ApiError:40022Title`),
      closeButtonContent: i18next.t('Common:Dismiss'),
      ...options,
    }),
  40025: options =>
    alert(i18next.t(`ApiError:40025Description`), {
      title: i18next.t(`ApiError:40025Title`),
      ...options,
    }),
  40026: options =>
    alert(i18next.t(`ApiError:40026Description`), {
      title: i18next.t(`ApiError:40026Title`),
      ...options,
    }),
  41000: options =>
    alert(i18next.t(`ApiError:41000Description`), {
      title: i18next.t(`ApiError:41000Title`),
      onClose: () => {
        const callbackUrl = encodeURIComponent(ROUTER_PATHS.ORDERING_HOME);

        window.location.href = getRedirectUrl(
          `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
          `&callbackUrl=${callbackUrl}`
        );
      },
      ...options,
    }),
  41014: options =>
    alert(i18next.t(`ApiError:41000Description`), {
      title: i18next.t(`ApiError:41000Title`),
      closeButtonContent: i18next.t('Common:Reorder'),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`);
      },
      ...options,
    }),
  41016: options =>
    alert(i18next.t(`ApiError:41016Description`), {
      title: i18next.t(`ApiError:41016Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  41017: options =>
    alert(i18next.t(`ApiError:41017Description`), {
      title: i18next.t(`ApiError:41017Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  51000: options =>
    fullScreen(i18next.t(`ApiError:51000Description`), {
      title: i18next.t(`ApiError:51000Title`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        window.location.reload();
      },
      ...options,
    }),
  51001: options =>
    alert(i18next.t(`ApiError:51001Description`), {
      title: i18next.t(`ApiError:51001Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  51002: options =>
    alert(i18next.t(`ApiError:51002Description`), {
      title: i18next.t(`ApiError:51002Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  51003: options =>
    alert(i18next.t(`ApiError:51003Description`), {
      title: i18next.t(`ApiError:51003Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  51004: options =>
    alert(i18next.t(`ApiError:51004Description`), {
      title: i18next.t(`ApiError:51004Title`),
      closeButtonContent: i18next.t('Common:OK'),
      ...options,
    }),
  54011: options =>
    alert(i18next.t(`ApiError:CreateOrderErrorDescription`), {
      title: i18next.t(`ApiError:54011Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  54012: options =>
    alert(i18next.t(`ApiError:54012Description`), {
      title: i18next.t(`ApiError:54012Title`),
      closeButtonContent: i18next.t('Common:EditCart'),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  54013: options =>
    alert(i18next.t(`ApiError:54013Description`), {
      title: i18next.t(`ApiError:54013Title`),
      closeButtonContent: i18next.t('Common:EditCart'),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  54014: options =>
    alert(i18next.t(`ApiError:54014Description`), {
      title: i18next.t(`ApiError:54014Title`),
      closeButtonContent: i18next.t('Common:EditCart'),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  54020: options =>
    alert(i18next.t(`ApiError:54020Description`), {
      title: i18next.t(`ApiError:54020Title`),
      ...options,
    }),
  54023: options =>
    alert(i18next.t(`ApiError:54023Description`), {
      title: i18next.t(`ApiError:54023Title`),
      ...options,
    }),
  54025: options =>
    fullScreen(i18next.t(`ApiError:StoreNotFoundDescription`), {
      title: i18next.t(`ApiError:StoreNotFoundTitle`),
      closeButtonContent: i18next.t('Common:BackToHome'),
      onClose: () => {
        window.location.reload();
      },
      ...options,
    }),
  54040: options =>
    alert(i18next.t(`ApiError:54040Description`), {
      title: i18next.t(`ApiError:54040Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`);
      },
      ...options,
    }),
  54050: options =>
    alert(i18next.t(`ApiError:54050Description`), {
      title: i18next.t(`ApiError:54050Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  54051: options =>
    alert(i18next.t(`ApiError:54051Description`), {
      title: i18next.t(`ApiError:54051Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  57002: options =>
    alert(i18next.t('ApiError:57002Description'), { title: i18next.t('ApiError:57002Title'), ...options }),
  57008: options =>
    alert(i18next.t(`ApiError:57008Description`), {
      title: i18next.t(`ApiError:57008Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  57009: options =>
    alert(i18next.t(`ApiError:57009Description`), {
      title: i18next.t(`ApiError:57009Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`);
      },
      ...options,
    }),
  57010: options =>
    alert(i18next.t(`ApiError:57010Description`), {
      title: i18next.t(`ApiError:57010Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  57011: options =>
    alert(i18next.t(`ApiError:57011Description`), {
      title: i18next.t(`ApiError:57011Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_PAYMENT}`);
      },
      ...options,
    }),
  57013: options =>
    alert(i18next.t(`ApiError:57013Description`), {
      title: i18next.t(`ApiError:57013Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.CONTACT_DETAIL}`);
      },
      ...options,
    }),
  58050: options =>
    alert(i18next.t(`ApiError:58050Description`), {
      title: i18next.t(`ApiError:58050Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
  58053: options =>
    alert(i18next.t(`ApiError:58053Description`), {
      title: i18next.t(`ApiError:58053Title`),
      onClose: () => {
        window.location.href = getRedirectUrl(`${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`);
      },
      ...options,
    }),
};
