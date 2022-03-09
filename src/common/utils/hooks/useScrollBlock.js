import { useRef, useEffect } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { useUnmount } from 'react-use';
import { block, unblock } from '../scroll-blocker';

const useScrollBlock = shouldBlock => {
  const uid = useRef(_uniqueId());
  useEffect(() => {
    if (shouldBlock) {
      block(uid.current);
    } else {
      unblock(uid.current);
    }
  }, [shouldBlock]);
  useUnmount(() => {
    unblock(uid.current);
  });
};

export default useScrollBlock;
