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
    const classList = ['item border__bottom-divider item-padding'];
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
          <div className="item__detail flex flex-column flex-space-between">
            <div className="item__detail-content">
              {hasTag ? (
                <div className="tag__card-container">
                  <Tag text={t('BestSeller')} className="tag__card active downsize"></Tag>
                </div>
              ) : null}
              <summary className="item__title font-weight-bolder">
                <span className="item__title-productName" data-testid="itemDetailSummary">
                  {title}
                </span>
              </summary>
              {variation ? <p className="item__description">{variation}</p> : null}
            </div>
            {detail}
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
