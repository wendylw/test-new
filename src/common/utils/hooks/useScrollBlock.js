import { useEffect } from 'react';
import _uniqueId from 'lodash/uniqueId';
import { useUnmount } from 'react-use';
import useRefInitializer from './useRefInitializer';
import { block, unblock } from '../scroll-blocker';

const useScrollBlock = shouldBlock => {
  const uid = useRefInitializer(() => _uniqueId());
  useEffect(() => {
    if (shouldBlock) {
      block(uid.current);
    } else {
      unblock(uid.current);
    }
  }, [shouldBlock, uid]);
  useUnmount(() => {
    unblock(uid.current);
  });
};

export default useScrollBlock;
