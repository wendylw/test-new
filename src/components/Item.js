import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Image from './Image';
import Tag from './Tag';

export class Item extends Component {
  render() {
    const {
      t,
      children,
      className,
      contentClassName,
      image,
      title,
      variation,
      detail,
      operateItemDetail,
      productDetailImageRef,
      hasTag,
    } = this.props;
    const classList = ['item border__bottom-divider flex flex-space-between'];
    const contentClassList = ['item__content flex'];

    if (className) {
      classList.push(className);
    }

    if (contentClassName) {
      contentClassList.push(contentClassName);
    }

    return (
      <li className={classList.join(' ')}>
        <div className={contentClassList.join(' ')} onClick={() => operateItemDetail()}>
          <Image ref={productDetailImageRef} className="item__image-container" src={image} alt={title} />
          <div className="item__detail">
            {hasTag ? (
              <div className="tag__card-container">
                <Tag text={t('BestSeller')} className="tag__card active downsize"></Tag>
              </div>
            ) : null}
            <summary className="item__title font-weight-bold">{title}</summary>
            {variation ? <p className="item__description">{variation}</p> : null}
            <span className="gray-font-opacity">{detail}</span>
          </div>
        </div>

        {children}
      </li>
    );
  }
}

Item.propTypes = {
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  variation: PropTypes.string,
  detail: PropTypes.any,
  operateItemDetail: PropTypes.func,
  productDetailImageRef: PropTypes.any,
  hasTag: PropTypes.bool,
};

Item.defaultProps = {
  image: '',
  variation: '',
  operateItemDetail: () => {},
  hasTag: false,
};

export default withTranslation()(Item);
