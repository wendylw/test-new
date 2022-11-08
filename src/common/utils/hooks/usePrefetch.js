import { useMount } from 'react-use';
import prefetch from '../prefetch-assets';

const usePrefetch = (chunkNames, i18nNames) => {
  useMount(() => {
    prefetch(chunkNames, i18nNames);
  });
};

export default usePrefetch;
