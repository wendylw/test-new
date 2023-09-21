import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Image from '../../components/Image';
import './ProductItem.scss';
import { extractDataAttributes } from '../../common/utils';

class ProductItem extends Component {
  renderImageEl() {
    const { title, imageUrl, imageCover } = this.props;

    return (
      <div className="product-item__image-container flex__shrink-fixed margin-small">
        <Image className="product-item__image card__image" src={imageUrl} alt={title} />
        {imageCover}
      </div>
    );
  }

  renderContent() {
    const { t, summaryTag, title, variation, details, shouldShowTakeawayVariant } = this.props;

    return (
      <div
        className="product-item__summary flex flex-column flex-space-between flex__fluid-content padding-smaller margin-top-bottom-smaller"
        data-testid="itemDetail"
      >
        <div className="product-item__summary-content">
          {summaryTag}
          <h3 className="product-item__title margin-top-bottom-smaller text-line-height-base text-omit__multiple-line text-weight-bolder">
            {title}
          </h3>
          {variation ? (
            <p
              className="product-item__description margin-top-bottom-smaller text-omit__multiple-line"
              data-testid="itemDetailSummary"
            >
              {variation}
            </p>
          ) : null}
          {shouldShowTakeawayVariant ? (
            <div className="margin-top-bottom-smaller">
              <span className="product-item__takeaway-variant">{t('TakeAway')}</span>
            </div>
          ) : null}
        </div>
        {details}
      </div>
    );
  }

  render() {
    const { children, className, handleClickItem } = this.props;
    const classList = ['product-item flex flex-top', ...(className ? [className] : [])];

    return (
      <div
        className={classList.join(' ')}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...extractDataAttributes(this.props)}
        onClick={() => handleClickItem()}
        role="button"
        tabIndex="0"
        data-test-id="ordering.product.item-card"
      >
        {this.renderImageEl()}
        {this.renderContent()}
        {children}
      </div>
    );
  }
}
ProductItem.displayName = 'ProductItem';

ProductItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  imageUrl: PropTypes.string,
  imageCover: PropTypes.element,
  summaryTag: PropTypes.element,
  title: PropTypes.string,
  variation: PropTypes.string,
  details: PropTypes.element,
  shouldShowTakeawayVariant: PropTypes.bool,
  handleClickItem: PropTypes.func,
};

ProductItem.defaultProps = {
  imageUrl: null,
  imageCover: null,
  summaryTag: null,
  title: '',
  className: '',
  variation: '',
  details: null,
  children: null,
  shouldShowTakeawayVariant: false,
  handleClickItem: () => {},
};

export const ItemStoryComponent = ProductItem;
export default withTranslation()(ProductItem);
