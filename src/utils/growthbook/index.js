import { GrowthBook } from '@growthbook/growthbook';
import config from '../../config';
import tids from '../monitoring/tracing-id';
import logger, { getMerchantID } from '../monitoring/logger';
import { getIsDebugMode } from '../monitoring/utils';
import { FEATURE_ENABLE_STATES } from './constants';

const isGrowthBookEnabled = config.growthBookEnabled;

/* Singleton initialization */
let growthbook;

const initInstance = () => {
  const id = tids.perm_tid;
  const business = getMerchantID();
  const enableDevMode = getIsDebugMode();
  const apiHost = config.growthBookAPIHost;
  const clientKey = config.growthBookClientKey;

  growthbook = new GrowthBook({
    apiHost,
    clientKey,
    // Enable easier debugging during development
    enableDevMode,
    // Targeting attributes
    attributes: {
      id,
      business,
      // Refer to: https://storehub.atlassian.net/wiki/spaces/~303314318/pages/2374107408/Best+Practices+of+GrowthBook+Feature+Management#Appendix%3A-Product-Name-Mappings
      product: 'Beep Web',
    },
    onFeatureUsage: (key, result) => {
      const { value, source, ruleId } = result;
      const { ENABLED, DISABLED } = FEATURE_ENABLE_STATES;

      logger.log('Utils_GrowthBook_FeatureEvaluated', {
        id: ruleId,
        name: key,
        type: value ? ENABLED : DISABLED,
        source,
      });
    },
  });

  return growthbook;
};

const getInstance = () => {
  if (!isGrowthBookEnabled) {
    return undefined;
  }

  // Only initialize instance if growthbook is enabled but not initialized
  if (!growthbook) {
    return initInstance();
  }

  return growthbook;
};

/* Public API Definitions */
const loadFeatures = options => {
  const gb = getInstance();

  if (!gb) {
    return Promise.reject(new Error('GrowthBook is not enabled'));
  }

  return gb.loadFeatures({ ...options });
};

const refreshFeatures = options => {
  const gb = getInstance();

  if (!gb) {
    return Promise.reject(new Error('GrowthBook is not enabled'));
  }

  return gb.refreshFeatures({ ...options });
};

const isOn = key => {
  const gb = getInstance();

  if (!gb) {
    return false;
  }

  return gb.isOn(key);
};

const getFeatureValue = (key, defaultValue) => {
  const gb = getInstance();
  // In a disabled environment, the feature will always be evaluated by its default value.
  if (!gb) {
    return defaultValue;
  }
  return gb.getFeatureValue(key, defaultValue);
};

const setRenderer = renderer => {
  const gb = getInstance();

  return gb?.setRenderer(renderer);
};

export default {
  isOn,
  getInstance,
  setRenderer,
  loadFeatures,
  refreshFeatures,
  getFeatureValue,
};
