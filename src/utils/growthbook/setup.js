import { store as orderingStore } from '../../ordering/redux/store';
import { store as rewardsStore } from '../../rewards/redux/store';
import { loadFeatureFlags, refreshFeatureFlags, updateFeatureFlagResults } from '../../redux/modules/growthbook/thunks';
import GrowthBook from '.';

const stores = [orderingStore, rewardsStore];

const dispatchLoadFeatureFlagsThunk = () => {
  stores.forEach(store => store.dispatch(loadFeatureFlags()));
};

const dispatchRefreshFeatureFlagsThunk = () => {
  stores.forEach(store => store.dispatch(refreshFeatureFlags()));
};

const dispatchUpdateFeatureFlagResultsThunk = () => {
  stores.forEach(store => store.dispatch(updateFeatureFlagResults()));
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
