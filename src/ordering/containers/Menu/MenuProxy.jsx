import React from 'react';
import { useSelector } from 'react-redux';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import { getStoreId } from './redux/common/selectors';
import Menu from '.';

const MenuProxy = props => {
  const storeId = useSelector(getStoreId);

  usePrefetch(['ORD_SC', 'ORD_TS'], ['OrderingCart', 'OrderingPromotion', 'OrderingTableSummary']);

  // FB-4011: we use key property to force <Menu /> to re-render when store id changes. Otherwise, the time slot and product information will probably be incorrect.
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Menu key={storeId} {...props} />;
};
MenuProxy.displayName = 'MenuProxy';

export default MenuProxy;
