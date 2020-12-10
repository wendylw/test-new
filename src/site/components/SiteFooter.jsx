import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { IconHome, IconCropFree /*IconAccountCircle*/ } from '../../components/Icons';
import Constants from '../../utils/constants';

const { ROUTER_PATHS } = Constants;
const tabs = [
  { pathname: ROUTER_PATHS.SITE_HOME, component: IconHome },
  { pathname: ROUTER_PATHS.QRSCAN, component: IconCropFree },

  // todo: account page developer can open it to develop
  // { pathname: '/account', component: IconAccountCircle },
];

class SiteFooter extends Component {
  isIconActive = pathname => {
    return this.props.location.pathname === pathname;
  };

  render() {
    return (
      <footer className="entry__bar wrapper" data-heap-name="site.common.footer.container">
        <ul className="flex flex-middle flex-space-around">
          {tabs.map(tab => (
            <li key={tab.pathname} className="entry__item">
              <Link
                to={tab.pathname}
                data-heap-name="site.common.footer.tab-icon"
                data-heap-tab-pathname={tab.pathname}
              >
                <tab.component
                  className={`icon ${this.isIconActive(tab.pathname) ? 'icon__primary' : 'icon__default'}`}
                />
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    );
  }
}

export default withRouter(SiteFooter);
