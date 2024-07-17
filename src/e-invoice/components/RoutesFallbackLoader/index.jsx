import React from 'react';
import Loader from '../../../common/components/Loader';

const RoutesFallbackLoader = () => (
  <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full">
    <Loader className="tw-text-3xl tw-text-orange" />
  </div>
);

RoutesFallbackLoader.displayName = 'RoutesFallbackLoader';

export default RoutesFallbackLoader;
