import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMenuRevamp, getStoreId } from './redux/common/selectors';
import Home from '../Home';
import Menu from '.';

const MenuProxy = props => {
  const isMenuRevamp = useSelector(getIsMenuRevamp);
  const storeId = useSelector(getStoreId);

  // FB-4011: we use key property to force <Menu /> to re-render when store id changes. Otherwise, the time slot and product information will probably be incorrect.
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <>{isMenuRevamp ? <Menu key={storeId} {...props} /> : <Home {...props} />}</>;
};

MenuProxy.displayName = 'MenuProxy';

export default MenuProxy;
