import { createAsyncThunk } from '@reduxjs/toolkit';
import GrowthBook from '../../../utils/growthbook';
import logger from '../../../utils/monitoring/logger';
import { FEATURE_KEYS, DEFAULT_FEATURE_FLAG_RESULTS } from './constants';

export const loadFeatureFlags = createAsyncThunk('app/growthbook/loadFeatureFlags', async () => {
  const growthbook = GrowthBook.getInstance();

  if (!growthbook) {
    throw new Error('GrowthBook is not enabled');
  }

  try {
    await growthbook.loadFeatures({ autoRefresh: true, timeout: 2000 });
  } catch (error) {
    logger.error('Utils_GrowthBook_LoadFeaturesFailed', {
      error: error?.message,
    });

    throw error;
  }
});

export const refreshFeatureFlags = createAsyncThunk('app/growthbook/refreshFeatureFlags', async () => {
  const growthbook = GrowthBook.getInstance();

  if (!growthbook) {
    throw new Error('GrowthBook is not enabled');
  }

  try {
    await growthbook.refreshFeatures();
  } catch (error) {
    logger.error('Utils_GrowthBook_RefreshFeaturesFailed', {
      error: error?.message,
    });

    throw error;
  }
});

export const updateFeatureFlagResults = createAsyncThunk('app/growthbook/updateFeatureFlagResults', () => {
  const growthbook = GrowthBook.getInstance();

  if (!growthbook) {
    throw new Error('GrowthBook is not enabled');
  }

  // Get the current feature flag results by iterating over the feature flag keys.
  const featureFlagResults = Object.values(FEATURE_KEYS)
    .map(key => ({ key, value: GrowthBook.getFeatureValue(key, DEFAULT_FEATURE_FLAG_RESULTS[key]) }))
    .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), DEFAULT_FEATURE_FLAG_RESULTS);

  return featureFlagResults;
});
