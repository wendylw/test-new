import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { IconHome, IconCropFree, IconAccountCircle } from '../../components/Icons';
import Constants from '../../utils/constants';

const { ROUTER_PATHS } = Constants;
class SiteFooter extends Component {
  render() {
    return (
      <footer className="entry__bar wrapper">
        <ul className="flex flex-middle flex-space-around">
          <li className="entry__item icon__item active">
            <Link to={ROUTER_PATHS.SITE_HOME}>
              <IconHome className="icon icon__gray" />
            </Link>
          </li>
          <li className="entry__item icon__item">
            <Link to={ROUTER_PATHS.QRSCAN}>
              <IconCropFree className="icon icon__gray" />
            </Link>
          </li>
          <li className="entry__item icon__item">
            <IconAccountCircle className="icon icon__gray" />
          </li>
        </ul>
      </footer>
    );
  }
}

export default SiteFooter;
