import { store as orderingStore } from '../../ordering/redux/store';
import { loadFeatureFlags, refreshFeatureFlags, updateFeatureFlagResults } from '../../redux/modules/growthbook/thunks';
import GrowthBook from '.';

const dispatchLoadFeatureFlagsThunk = () => {
  orderingStore.dispatch(loadFeatureFlags());
};

const dispatchRefreshFeatureFlagsThunk = () => {
  orderingStore.dispatch(refreshFeatureFlags());
};

const dispatchUpdateFeatureFlagResultsThunk = () => {
  orderingStore.dispatch(updateFeatureFlagResults());
};

const onNavigationChange = () => {
  dispatchRefreshFeatureFlagsThunk();
};

const onFeatureChange = () => {
  dispatchUpdateFeatureFlagResultsThunk();
};

GrowthBook.getInstance();

// Load features on page load
dispatchLoadFeatureFlagsThunk();

// Re-render when features change
GrowthBook.setRenderer(onFeatureChange);

// Refresh the features when a navigation event occurs
window.addEventListener('sh-location-change', onNavigationChange);
