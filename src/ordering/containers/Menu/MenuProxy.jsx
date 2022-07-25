import React from 'react';
import { useSelector } from 'react-redux';
import { getStoreId } from './redux/common/selectors';
import Menu from '.';

const MenuProxy = props => {
  const storeId = useSelector(getStoreId);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Menu key={storeId} {...props} />;
};
MenuProxy.displayName = 'MenuProxy';

export default MenuProxy;
