import React, { Component } from 'react';
import { IconHome, IconCropFree, IconAccountCircle } from '../../../components/Icons';

class SiteFooter extends Component {
  render() {
    return (
      <footer className="entry__bar wrapper">
        <ul className="flex flex-middle flex-space-around">
          <li className="entry__item icon__item active">
            <IconHome className="icon icon__gray" />
          </li>
          <li className="entry__item icon__item">
            <IconCropFree className="icon icon__gray" />
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
