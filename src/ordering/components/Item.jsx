import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import withDataAttributes from '../../components/withDataAttributes';
import './Item.scss';

class Item extends Component {
  renderImageEl() {
    const { image, imageCover } = this.props;

    return (
      <div className="item__image-container flex__shrink-fixed margin-small">
        {image}
        {imageCover}
      </div>
    );
  }

  renderContent() {
    const { tag, title, variation, details } = this.props;

    return (
      <div
        className="item__summary flex flex-column flex-space-between flex__fluid-content padding-smaller margin-top-bottom-smaller"
        data-testid="itemDetail"
      >
        <div className="item__summary-content">
          {tag}
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
    const classList = ['item flex flex-top'];

    return (
      <li className="" {...dataAttributes} onClick={() => handleClickItem()}>
        {this.renderImageEl()}
        {this.renderContent()}
        {children}
      </li>
    );
  }

  //   render() {
  //     const {
  //       children,
  //       className,
  //       contentClassName,
  //       image,
  //       title,
  //       variation,
  //       detail,
  //       operateItemDetail,
  //       productDetailImageRef,
  //       tagText,
  //       dataAttributes,
  //       isLazyLoad,
  //       productItemMinHeight,
  //       scrollContainer,
  //     } = this.props;
  //     const classList = ['item border__bottom-divider'];
  //     const contentClassList = ['item__content flex padding-left-right-smaller padding-top-bottom-small'];

  //     if (className) {
  //       classList.push(className);
  //     }

  //     if (contentClassName) {
  //       contentClassList.push(contentClassName);
  //     }

  //     if (isLazyLoad) {
  //       return (
  //         <LazyLoad offset={0} height={productItemMinHeight} scrollContainer={scrollContainer}>
  //           <div className={classList.join(' ')} {...dataAttributes}>
  //             <div className={contentClassList.join(' ')} onClick={() => operateItemDetail()}>
  //               <div className="item__image-container flex__shrink-fixed margin-small">
  //                 <Image ref={productDetailImageRef} className="item__image card__image" src={image} alt={title} />
  //               </div>
  //               <div
  //                 className="item__summary flex flex-column flex-space-between padding-smaller margin-top-bottom-smaller"
  //                 data-testid="itemDetail"
  //               >
  //                 <div className="item__summary-content">
  //                   {tagText ? <Tag text={tagText} className="tag__small tag__primary text-size-smaller"></Tag> : null}
  //                   <h3 className="item__title margin-top-bottom-smaller text-line-height-base text-omit__multiple-line text-weight-bolder">
  //                     {title}
  //                   </h3>
  //                   {variation ? (
  //                     <p
  //                       className="item__description margin-top-bottom-small text-omit__multiple-line"
  //                       data-testid="itemDetailSummary"
  //                     >
  //                       {variation}
  //                     </p>
  //                   ) : null}
  //                 </div>
  //                 {detail}
  //               </div>
  //             </div>

  //             {children}
  //           </div>
  //         </LazyLoad>
  //       );
  //     }

  //     return (
  //       <div className={classList.join(' ')} {...dataAttributes}>
  //         <div className={contentClassList.join(' ')} onClick={() => operateItemDetail()}>
  //           <div className="item__image-container flex__shrink-fixed margin-small">
  //             <Image ref={productDetailImageRef} className="item__image card__image" src={image} alt={title} />
  //           </div>
  //           <div
  //             className="item__summary flex flex-column flex-space-between padding-smaller margin-top-bottom-smaller"
  //             data-testid="itemDetail"
  //           >
  //             <div className="item__summary-content">
  //               {tagText ? <Tag text={tagText} className="tag__small tag__primary text-size-smaller"></Tag> : null}
  //               <h3 className="item__title margin-top-bottom-smaller text-omit__multiple-line text-weight-bolder">
  //                 {title}
  //               </h3>
  //               {variation ? (
  //                 <p
  //                   className="item__description margin-top-bottom-small text-omit__multiple-line"
  //                   data-testid="itemDetailSummary"
  //                 >
  //                   {variation}
  //                 </p>
  //               ) : null}
  //             </div>
  //             {detail}
  //           </div>
  //         </div>

  //         {children}
  //       </div>
  //     );
  //   }
}

Item.propTypes = {
  className: PropTypes.string,
  image: PropTypes.element,
  imageCover: PropTypes.element,
  tag: PropTypes.element,
  title: PropTypes.string,
  variation: PropTypes.string,
  details: PropTypes.element,
  handleClickItem: PropTypes.func,
};

Item.defaultProps = {
  image: null,
  imageCover: null,
  tag: null,
  title: '',
  variation: '',
  details: null,
  handleClickItem: () => {},
};

export const ItemStoryComponent = Item;
export default withDataAttributes(withTranslation()(Item));
