import React from 'react';
import { useMount } from 'react-use';
import Frame from '../../../common/components/Frame';

const StoreReview = () => {
  useMount(() => {
    // do nothing
  });

  return (
    <Frame>
      <p>Hey, this is store review test!</p>
    </Frame>
  );
};

StoreReview.displayName = 'StoreReview';

export default StoreReview;
