import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePrevious, useUnmount } from 'react-use';
import PropTypes from 'prop-types';
import useMeasureBorderBox from '../../utils/hooks/useMeasureBorderBox';

export const SpaceOccupationContext = createContext({
  bottom: 0,
  adjustBottom: () => {},
});

// Use this hook on footer or header that occupies global space,
// so that other components can adjust their position accordingly.
// Currently only the bottom position is supported, we may add top
// if needed.
export const useSpaceOccupationAdjustment = () => {
  const [ref, { borderBoxHeight }] = useMeasureBorderBox();

  const prevBorderBoxHeight = usePrevious(borderBoxHeight);
  const { adjustBottom } = useContext(SpaceOccupationContext);
  useEffect(() => {
    if (prevBorderBoxHeight !== borderBoxHeight) {
      adjustBottom(borderBoxHeight - (prevBorderBoxHeight || 0));
    }
  }, [borderBoxHeight, prevBorderBoxHeight, adjustBottom]);
  useUnmount(() => {
    adjustBottom(-borderBoxHeight);
  });
  return ref;
};

// Use this hook to know how much space is occupied by the footer.
export const useSpaceOccupation = () => {
  const { bottom } = useContext(SpaceOccupationContext);
  return { bottom };
};

export const SpaceOccupationContextProvider = ({ children }) => {
  const [bottom, setBottom] = useState(0);

  const adjustBottom = useCallback(
    value => {
      setBottom(bottom + value);
    },
    [bottom]
  );

  return <SpaceOccupationContext.Provider value={{ bottom, adjustBottom }}>{children}</SpaceOccupationContext.Provider>;
};

SpaceOccupationContextProvider.displayName = 'SpaceOccupationContextProvider';
SpaceOccupationContextProvider.propTypes = {
  children: PropTypes.node,
};
SpaceOccupationContextProvider.defaultProps = {
  children: null,
};
