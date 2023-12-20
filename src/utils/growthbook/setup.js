import { store as orderingStore } from '../../ordering/redux/store';
import { loadFeatureFlags, updateFeatureFlagResults } from '../../redux/modules/growthbook/thunks';
import GrowthBook from '.';

const stores = [orderingStore, rewardsStore];

const dispatchLoadFeatureFlagsThunk = () => {
  stores.forEach(store => store.dispatch(loadFeatureFlags()));
};

const dispatchUpdateFeatureFlagResultsThunk = () => {
  stores.forEach(store => store.dispatch(updateFeatureFlagResults()));
};

const onFeatureChange = () => {
  dispatchUpdateFeatureFlagResultsThunk();
};

GrowthBook.getInstance();

// Load features on page load
dispatchLoadFeatureFlagsThunk();

// Re-render when features change
GrowthBook.setRenderer(onFeatureChange);
