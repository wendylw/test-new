import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import withDataAttributes from '../../components/withDataAttributes';
import Image from '../../components/Image';
import './Item.scss';

class Item extends Component {
  renderImageEl() {
    const { title, imageUrl, imageCover } = this.props;

    return (
      <div className="item__image-container flex__shrink-fixed margin-small">
        <Image className="item__image card__image" src={imageUrl} alt={title} />
        {imageCover}
      </div>
    );
  }

  renderContent() {
    const { summaryTag, title, variation, details } = this.props;

    return (
      <div
        className="item__summary flex flex-column flex-space-between flex__fluid-content padding-smaller margin-top-bottom-smaller"
        data-testid="itemDetail"
      >
        <div className="item__summary-content">
          {summaryTag}
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
        {details}
      </div>
    );
  }

  render() {
    const { children, className, dataAttributes, handleClickItem } = this.props;
    const classList = ['item flex flex-top', ...(className ? [className] : [])];

    return (
      <div className={classList.join(' ')} {...dataAttributes} onClick={() => handleClickItem()}>
        {this.renderImageEl()}
        {this.renderContent()}
        {children}
      </div>
    );
  }
}

Item.propTypes = {
  className: PropTypes.string,
  imageUrl: PropTypes.string,
  imageCover: PropTypes.element,
  summaryTag: PropTypes.element,
  title: PropTypes.string,
  variation: PropTypes.string,
  details: PropTypes.element,
  handleClickItem: PropTypes.func,
};

Item.defaultProps = {
  imageUrl: null,
  imageCover: null,
  summaryTag: null,
  title: '',
  variation: '',
  details: null,
  handleClickItem: () => {},
};

export const ItemStoryComponent = Item;
export default withDataAttributes(withTranslation()(Item));
