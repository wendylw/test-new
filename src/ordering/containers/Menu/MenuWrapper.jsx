import React from 'react';
import { useSelector } from 'react-redux';
import { getStoreId } from './redux/common/selectors';
import Menu from '.';

const MenuWrapper = props => {
  const storeId = useSelector(getStoreId);

  // FB-4011: we use key property to force <Menu /> to re-render when store id changes. Otherwise, the time slot and product information will probably be incorrect.
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Menu key={storeId} {...props} />;
};
MenuWrapper.displayName = 'MenuWrapper';

export default MenuWrapper;
