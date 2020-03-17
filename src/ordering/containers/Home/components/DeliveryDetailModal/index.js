import React, { Component } from 'react';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';
import { IconMotorcycle } from '../../../../../components/Icons';

class DeliveryDetailModal extends Component {
  render() {
    const { onlineStoreInfo, show, onToggle } = this.props;
    const getClassName = show => {
      return show ? 'aside active' : 'aside';
    };
    return (
      <aside className={getClassName(show)} onClick={() => onToggle(null)}>
        <div className="store-info">
          <i className="aside-bottom__slide-button"></i>

          <div className="flex flex-top flex-space-between">
            <Image
              className="header__image-container text-middle"
              src={onlineStoreInfo.logo}
              alt={onlineStoreInfo.title}
            />
            <div className="header__title-container">
              <h1 className="header__title">
                <span className="font-weight-bold text-middle">{onlineStoreInfo.storeName}</span>
                <div className="tag__card-container">
                  <Tag text="Closed" className="tag__card warning downsize text-middle"></Tag>
                </div>
              </h1>
              <p className="store-info__address gray-font-opacity">
                34, Jalan Ambong 4, Kepong Baru, 52100 Kuala Lumpur
              </p>
              <a className="store-info__phone link link__non-underline" href="tel:+6001298765432">
                +60 012 98765432
              </a>
              <ul className="header__info-list">
                <li className="header__info-item">
                  <i className="header__motor-icon text-middle">
                    <IconMotorcycle />
                  </i>
                  <span className="text-middle">RM 5.00</span>
                </li>
                <li className="header__info-item">
                  <span>Min Order. RM 20.00</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="store-info__delivery-hours flex flex-top flex-space-between">
            <label className="font-weight-bold gray-font-opacity">Delivery Hours</label>
            <ul className="store-info__list">
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
              <li className="store-info__item flex flex-middle flex-space-between">
                <span>Sun</span>
                <time>11:00 - 22:30</time>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    );
  }
}

export default DeliveryDetailModal;
