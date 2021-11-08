import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setTabBarVisibility } from '../utils/tng-utils';
import Constants from '../utils/constants';

const { ROUTER_PATHS } = Constants;

const DISPLAY_TAB_BAR_PATHS = [ROUTER_PATHS.SITE_HOME, ROUTER_PATHS.ORDER_HISTORY];

function TngMiniProgramTabBar() {
  const location = useLocation();

  useEffect(() => {
    setTabBarVisibility(DISPLAY_TAB_BAR_PATHS.includes(location.pathname));
  }, [location]);

  return null;
}

TngMiniProgramTabBar.displayName = 'TngMiniProgramTabBar';

export default TngMiniProgramTabBar;
