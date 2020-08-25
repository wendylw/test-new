import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import LazyLoad from 'react-lazyload';
import withDataAttributes from './withDataAttributes';
import Image from './Image';
import Tag from './Tag';
import './Item.scss';

export class Item extends Component {
  render() {
    const {
      children,
      className,
      contentClassName,
      image,
      title,
      variation,
      detail,
      operateItemDetail,
      productDetailImageRef,
      tagText,
      dataAttributes,
      isLazyLoad,
      productItemMinHeight,
      scrollContainer,
    } = this.props;
    const classList = ['item border__bottom-divider'];
    const contentClassList = ['item__content flex padding-left-right-smaller padding-top-bottom-small'];

    if (className) {
      classList.push(className);
    }

    if (contentClassName) {
      contentClassList.push(contentClassName);
    }

    if (isLazyLoad) {
      return (
        <LazyLoad offset={0} height={productItemMinHeight} scrollContainer={scrollContainer}>
          <div className={classList.join(' ')} {...dataAttributes}>
            <div className={contentClassList.join(' ')} onClick={() => operateItemDetail()}>
              <div className="item__image-container flex__shrink-fixed margin-small">
                <Image ref={productDetailImageRef} className="item__image card__image" src={image} alt={title} />
              </div>
              <summary
                className="item__summary flex flex-column flex-space-between padding-smaller margin-top-bottom-smaller"
                data-testid="itemDetail"
              >
                <div className="item__summary-content">
                  {tagText ? <Tag text={tagText} className="tag__small tag__primary text-size-smaller"></Tag> : null}
                  <h3 className="item__title margin-top-bottom-smaller text-line-height-base text-omit__multiple-line text-weight-bolder">
                    {title}
                  </h3>
                  {variation ? (
                    <p
                      className="item__description margin-top-bottom-small text-omit__multiple-line"
                      data-testid="itemDetailSummary"
                    >
                      {variation}
                    </p>
                  ) : null}
                </div>
                {detail}
              </summary>
            </div>

            {children}
          </div>
        </LazyLoad>
      );
    }

    return (
      <div className={classList.join(' ')} {...dataAttributes}>
        <div className={contentClassList.join(' ')} onClick={() => operateItemDetail()}>
          <div className="item__image-container flex__shrink-fixed margin-small">
            <Image ref={productDetailImageRef} className="item__image card__image" src={image} alt={title} />
          </div>
          <summary
            className="item__summary flex flex-column flex-space-between padding-smaller margin-top-bottom-smaller"
            data-testid="itemDetail"
          >
            <div className="item__summary-content">
              {tagText ? <Tag text={tagText} className="tag__small tag__primary text-size-smaller"></Tag> : null}
              <h3 className="item__title margin-top-bottom-smaller text-omit__multiple-line text-weight-bolder">
                {title}
              </h3>
              {variation ? (
                <p
                  className="item__description margin-top-bottom-small text-omit__multiple-line"
                  data-testid="itemDetailSummary"
                >
                  {variation}
                </p>
              ) : null}
            </div>
            {detail}
          </summary>
        </div>

        {children}
      </div>
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
  tagText: PropTypes.string,
};

Item.defaultProps = {
  image: '',
  variation: '',
  operateItemDetail: () => {},
  hasTag: false,
};

export default withDataAttributes(withTranslation()(Item));
