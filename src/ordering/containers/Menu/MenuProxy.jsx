import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMenuRevamp } from './redux/common/selectors';
import Home from '../Home';
import Menu from '.';

const MenuProxy = props => {
  const isMenuRevamp = useSelector(getIsMenuRevamp);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <>{isMenuRevamp ? <Menu {...props} /> : <Home {...props} />}</>;
};

MenuProxy.displayName = 'MenuProxy';

export default MenuProxy;
