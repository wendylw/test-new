import { store as orderingStore } from '../../ordering/redux/store';
import { loadFeatureFlags, updateFeatureFlagResults } from '../../redux/modules/growthbook/thunks';
import GrowthBook from '.';

const dispatchLoadFeatureFlagsThunk = () => {
  orderingStore.dispatch(loadFeatureFlags());
};

const dispatchUpdateFeatureFlagResultsThunk = () => {
  orderingStore.dispatch(updateFeatureFlagResults());
};

const onFeatureChange = () => {
  dispatchUpdateFeatureFlagResultsThunk();
};

GrowthBook.getInstance();

// Load features on page load
dispatchLoadFeatureFlagsThunk();

// Re-render when features change
GrowthBook.setRenderer(onFeatureChange);
