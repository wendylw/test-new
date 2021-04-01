import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import { withTranslation } from 'react-i18next';
import Tag from '../../../../components/Tag';
import Image from '../../../../components/Image';
import VariationSelector from './VariationSelector';
import { IconClose } from '../../../../components/Icons';
import ItemOperator from '../../../../components/ItemOperator';
import CurrencyNumber from '../../../components/CurrencyNumber';
import config from '../../../../config';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import SwiperCore, { Autoplay, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getSelectedProductDetail } from '../../../redux/modules/home';
import { actions as appActionCreators } from '../../../redux/modules/app';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import { withRouter } from 'react-router-dom';
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';
import './ProductDetailDrawer.scss';

const VARIATION_TYPES = {
  SINGLE_CHOICE: 'SingleChoice',
  MULTIPLE_CHOICE: 'MultipleChoice',
};
const EXCLUDED_KEYS = ['variationType'];

SwiperCore.use([Autoplay, Pagination]);

class ProductDetailDrawer extends Component {
  productEl = null;
  productDescriptionImage = null;
  productDetailImage = null;
  buttonEl = null;
  asideEl = null;
  swipeEl = null;
  descriptionTimeOut = null;

  state = {
    variationsByIdMap: {}, // Object<VariationId: Object<variationType, OptionId:option >>
    cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
    resizedImage: false,
    currentProductDescriptionImageIndex: 0,
    minimumVariations: [],
    optionQuantity: {},
    childrenProduct: null,
    increasingProductOnCat: false,
  };

  componentDidMount() {
    const { selectedProduct } = this.props;

    this.initVariationsByIdMap(selectedProduct);

    if (this.swipeEl) {
      this.swipeEl.stop();
    }

    this.initMinimumVariationList();
  }

  componentDidUpdate(prevProps) {
    const { show, selectedProduct } = this.props;
    const { variations, id } = selectedProduct || {};

    if (!id || !variations) {
      return;
    }

    if (
      (!prevProps.selectedProduct && id) ||
      id !== prevProps.selectedProduct.id ||
      (show && prevProps.show !== show)
    ) {
      this.initVariationsByIdMap(selectedProduct);
      this.initMinimumVariationList();
    }

    if (!show && prevProps.show !== show) {
      this.setState({
        resizedImage: false,
        minimumVariations: [],
        optionQuantity: {},
      });
    }
  }

  resizeImage() {
    const { show } = this.props;
    const { resizedImage } = this.state;

    if (!this.productDescriptionImage || !ReactDOM.findDOMNode(this.productDetailImage) || !show || !resizedImage) {
      return {};
    }

    const pdI = this.productDescriptionImage;
    const pdIS = ReactDOM.findDOMNode(this.productDetailImage);
    const containerWidth = pdI.clientWidth;
    const containerHeight = pdI.clientHeight;
    const imageWidth = pdIS.clientWidth;
    const imageHeight = pdIS.clientHeight;
    const xOffset = pdIS.offsetLeft;
    const yOffset = containerHeight - imageHeight - xOffset;

    return {
      transformOrigin: `${xOffset / (containerWidth / imageWidth - 1) + xOffset}px ${yOffset /
        (containerHeight / imageHeight - 1) +
        yOffset}px`,
      transform: `scale(${imageWidth / containerWidth}, ${imageHeight / containerHeight})`,
    };
  }

  initVariationsByIdMap(product) {
    let newMap = {};

    if (!product || !product.variations) {
      return;
    }

    product.variations.forEach(variation => {
      if (variation.optionValues.length && variation.variationType === VARIATION_TYPES.SINGLE_CHOICE) {
        const defaultOption = variation.optionValues.find(o => !o.markedSoldOut);

        if (defaultOption) {
          newMap = Object.assign({}, newMap, this.getNewVariationsByIdMap(variation, defaultOption));
        }
      }
    });

    const childrenProduct = this.getChildrenProductBySelectedVariations(newMap);

    this.setState({
      childrenProduct,
      variationsByIdMap: newMap,
      cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
    });
  }

  initMinimumVariationList() {
    const { selectedProduct } = this.props;
    const { variations } = selectedProduct || {};
    var minimumVariations = (variations || []).filter(v => v.enableSelectionAmountLimit && v.minSelectionAmount);

    if (minimumVariations && minimumVariations.length) {
      this.setState({ minimumVariations });
    }
  }

  getTotalPriceDiff() {
    const { variationsByIdMap, optionQuantity, childrenProduct } = this.state;
    let totalPriceDiff = 0;

    _forEach(variationsByIdMap, options => {
      _forEach(options, (option, key) => {
        if (key === 'variationType') {
          return;
        }

        // childrenProduct only need add the multiple choice of variations priceDiff
        if (childrenProduct) {
          if (options.variationType === VARIATION_TYPES.MULTIPLE_CHOICE) {
            totalPriceDiff += option.priceDiff * (optionQuantity[key] || 1);
          }
        } else {
          totalPriceDiff += option.priceDiff * (optionQuantity[key] || 1);
        }
      });
    });

    return totalPriceDiff;
  }

  getDisplayPrice() {
    const { selectedProduct } = this.props;
    const { childrenProduct } = this.state;

    if (childrenProduct) {
      return childrenProduct.displayPrice + this.getTotalPriceDiff();
    }

    if (selectedProduct) {
      return selectedProduct.displayPrice + this.getTotalPriceDiff();
    }

    return 0;
  }

  getOriginalDisplayPrice() {
    const { selectedProduct } = this.props;
    const { childrenProduct } = this.state;

    if (childrenProduct && childrenProduct.originalDisplayPrice) {
      return childrenProduct.originalDisplayPrice + this.getTotalPriceDiff();
    }

    if (selectedProduct && selectedProduct.originalDisplayPrice) {
      return selectedProduct.originalDisplayPrice + this.getTotalPriceDiff();
    }

    return null;
  }

  getVariationText() {
    const { variationsByIdMap } = this.state;

    if (!variationsByIdMap && !Object.values(variationsByIdMap).length) {
      return '';
    }

    let variationTexts = [];

    Object.values(variationsByIdMap).forEach(function(variation) {
      Object.values(variation).forEach(option => {
        if (option.value) {
          variationTexts.push(option.value);
        }
      });
    });

    return variationTexts.join(', ');
  }

  isInvalidMinimumVariations() {
    const { variationsByIdMap, minimumVariations } = this.state;

    if (!minimumVariations || !minimumVariations.length) {
      return false;
    }

    if (!variationsByIdMap) {
      return minimumVariations[0].id;
    }

    for (let i = 0; i < minimumVariations.length; i++) {
      const { id, minSelectionAmount, allowMultiQty } = minimumVariations[i];
      const { optionQuantity } = this.state;

      if (allowMultiQty && variationsByIdMap[id]) {
        let selectTotal = 0;
        let optionKeyList = Object.keys(variationsByIdMap[id]).filter(item => item !== EXCLUDED_KEYS[0]);

        optionKeyList.forEach(key => {
          selectTotal += optionQuantity[key];
        });
        if (selectTotal < minSelectionAmount) {
          return id;
        }
      } else if (
        !variationsByIdMap[id] ||
        (variationsByIdMap[id] && Object.keys(variationsByIdMap[id]).length - 1 < minSelectionAmount)
      ) {
        return id;
      }
    }

    return false;
  }

  isSubmitable() {
    const { cartQuantity, variationsByIdMap } = this.state;
    const singleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.SINGLE_CHOICE);

    // check: cart should not empty
    let submitable = cartQuantity > 0;

    // check: if product has single variants, then they should be all selected.
    if (singleChoiceVariations.length > 0) {
      const selectedAllSingleChoice = !singleChoiceVariations.find(
        variation => !Object.keys(variationsByIdMap).includes(variation.id)
      );

      submitable = submitable && Object.values(variationsByIdMap).length > 0 && selectedAllSingleChoice;
    }

    return submitable;
  }

  getNewVariationsByIdMap(variation, option) {
    const newMap = {};

    if (!newMap[variation.id] || variation.variationType === VARIATION_TYPES.SINGLE_CHOICE) {
      newMap[variation.id] = {
        variationType: variation.variationType,
      };
    }

    if (newMap[variation.id] && !newMap[variation.id][option.id]) {
      newMap[variation.id][option.id] = {
        priceDiff: option.priceDiff,
        value: option.value,
      };
    }

    return newMap;
  }

  setVariationsByIdMap(variation, option) {
    const { variationsByIdMap } = this.state;
    const newVariation = this.getNewVariationsByIdMap(variation, option);
    let newMap = variationsByIdMap;

    if (!newMap[variation.id] || newMap[variation.id].variationType === VARIATION_TYPES.SINGLE_CHOICE) {
      newMap = Object.assign({}, newMap, newVariation);
    } else {
      if (newMap[variation.id][option.id]) {
        delete newMap[variation.id][option.id];
      } else {
        newMap[variation.id][option.id] = newVariation[variation.id][option.id];
      }
    }

    const childrenProduct = this.getChildrenProductBySelectedVariations(newMap);

    this.setState({ variationsByIdMap: newMap, childrenProduct });
  }

  getChildrenProductBySelectedVariations(selectedVariations) {
    const { selectedProduct } = this.props;
    const childrenMap = _get(selectedProduct, 'childrenMap', null);

    if (!childrenMap) {
      return null;
    }

    const selectedValues = [];
    _forEach(selectedVariations, options => {
      _forEach(options, (option, key) => {
        if (key === 'variationType') {
          return;
        }

        selectedValues.push(option.value);
      });
    });

    return childrenMap.find(({ variation }) => variation.every(v => selectedValues.includes(v)));
  }

  updateOptionQuantity = updateOptionQuantity => {
    this.setState({
      optionQuantity: {
        ...this.state.optionQuantity,
        ...updateOptionQuantity,
      },
    });
  };

  getChoiceVariations(type) {
    const { variations } = this.props.selectedProduct || {};

    return Array.isArray(variations) ? variations.filter(v => v.variationType === type) : [];
  }

  closeModal() {
    const { onToggle } = this.props;

    onToggle();

    if (this.swipeEl) {
      this.swipeEl.slide(0, 100);
      this.swipeEl.stop();
    }

    this.setState({
      cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
      resizedImage: false,
      currentProductDescriptionImageIndex: 0,
      increasingProductOnCat: false,
    });
  }

  handleHideProductDetail(e) {
    if (e && e.target !== e.currentTarget) {
      return;
    }

    this.closeModal();
  }

  handleGtmEventTracking = variables => {
    const { selectedProduct } = this.props;
    let childrenProduct = selectedProduct.childrenMap.find(child => child.childId === variables.productId);

    if (!childrenProduct) {
      childrenProduct = selectedProduct;
    }

    const gtmEventData = {
      product_name: selectedProduct.title,
      product_id: variables.productId,
      price_local: childrenProduct.displayPrice,
      variant: variables.variations,
      quantity: childrenProduct.quantityOnHand,
      product_type: selectedProduct.inventoryType,
      Inventory: !!selectedProduct.markedSoldOut ? 'In stock' : 'Out of stock',
      image_count: (selectedProduct.images && selectedProduct.images.length) || 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventData);
  };

  handleAddOrUpdateShoppingCartItem = async variables => {
    const { appActions } = this.props;

    this.handleGtmEventTracking(variables);

    await appActions.addOrUpdateShoppingCartItem(variables);
    await appActions.loadShoppingCart();

    this.handleHideProductDetail();
  };

  handleSwipeProductImage(index) {
    window.heap?.track('ordering.home.product-detail-swipe', { ImageIndex: index });
    this.setState({ currentProductDescriptionImageIndex: index });
  }

  renderVariations() {
    const { show } = this.props;
    const { variations } = this.props.selectedProduct || {};

    if (!variations || !variations.length) {
      return null;
    }

    const singleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.SINGLE_CHOICE);
    const multipleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.MULTIPLE_CHOICE);

    return (
      <div className="product-detail__variations">
        <ol className="">
          {singleChoiceVariations.map(variation => (
            <VariationSelector
              key={variation.id}
              variation={variation}
              initVariation={show}
              data-heap-name="ordering.home.product-detail.single-choice"
              data-heap-variation-name={variation.name}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))}
          {multipleChoiceVariations.map(variation => (
            <VariationSelector
              key={variation.id}
              variation={variation}
              initVariation={show}
              isInvalidMinimum={!!this.isInvalidMinimumVariations()}
              data-heap-name="ordering.home.product-detail.multi-choice"
              data-heap-variation-name={variation.name}
              updateOptionQuantity={this.updateOptionQuantity}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))}
        </ol>
      </div>
    );
  }

  addCartDisplayPrice = () => {
    const { cartQuantity } = this.state;
    return this.getDisplayPrice() * cartQuantity;
  };

  renderProductOperator() {
    const { t, selectedProduct = {}, onUpdateCartOnProductDetail } = this.props;
    const { cartQuantity, minimumVariations, increasingProductOnCat, childrenProduct } = this.state;
    const { id: productId } = selectedProduct;
    const hasMinimumVariations = minimumVariations && minimumVariations.length;

    if (!selectedProduct) {
      return null;
    }

    return (
      <React.Fragment>
        <footer
          className="product-detail__footer flex flex-middle flex-center padding-normal flex__shrink-fixed "
          ref={ref => (this.footerEl = ref)}
        >
          <button
            className="button add__button button__fill text-uppercase text-weight-bolder "
            disabled={
              increasingProductOnCat ||
              !this.isSubmitable() ||
              Utils.isProductSoldOut(selectedProduct || {}) ||
              (hasMinimumVariations && this.isInvalidMinimumVariations())
            }
            onClick={() => {
              const { variationsByIdMap, optionQuantity } = this.state;
              let variations = [];

              if (!this.isSubmitable()) {
                return;
              }

              this.setState({ increasingProductOnCat: true });

              Object.keys(variationsByIdMap).forEach(function(variationId) {
                Object.keys(variationsByIdMap[variationId]).forEach(key => {
                  if (!EXCLUDED_KEYS.includes(key)) {
                    variations.push({
                      variationId,
                      optionId: key,
                    });
                  }
                });
              });

              variations.forEach(item => {
                const { optionId } = item;

                if (optionQuantity[optionId]) {
                  item.quantity = optionQuantity[optionId];
                } else {
                  item.quantity = 1;
                }
              });

              if (onUpdateCartOnProductDetail) {
                onUpdateCartOnProductDetail({ selectedProduct });
              }

              this.handleAddOrUpdateShoppingCartItem({
                action: 'add',
                business: config.business,
                productId: (childrenProduct && childrenProduct.childId) || productId,
                quantity: cartQuantity,
                variations,
              });
            }}
          >
            {increasingProductOnCat ? (
              <span className="text-weight-bolder" key="Processing">
                {t('Processing')}
              </span>
            ) : (
              <React.Fragment>
                <span className="text-weight-bolder" key="AddCart">
                  {t('AddCart')} -
                </span>
                <CurrencyNumber
                  className="padding-small text-weight-bolder flex__shrink-fixed"
                  money={Number(this.addCartDisplayPrice()) || 0}
                />
              </React.Fragment>
            )}
          </button>
        </footer>
      </React.Fragment>
    );
  }

  renderProductLowStock = () => {
    const { t, selectedProduct } = this.props;

    return (
      <div className="text-center">
        <span className="text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand: 5 })}</span>
      </div>
    );
  };

  renderOperatorButton = () => {
    const { selectedProduct, onDncreaseProductDetailItem, onIncreaseProductDetailItem } = this.props;
    const { cartQuantity, minimumVariations } = this.state;

    const hasMinimumVariations = minimumVariations && minimumVariations.length;

    return (
      <div
        className="product-detail__operators  padding-normal flex flex-center flex__shrink-fixed"
        ref={ref => (this.opeartoresEl = ref)}
      >
        <ItemOperator
          className="flex-middle"
          data-heap-name="ordering.common.product-item.item-operator "
          quantity={cartQuantity}
          from="productDetail"
          decreaseDisabled={cartQuantity <= 1}
          onDecrease={() => {
            onDncreaseProductDetailItem(selectedProduct);
            this.setState({ cartQuantity: cartQuantity - 1 });
          }}
          onIncrease={() => {
            onIncreaseProductDetailItem(selectedProduct);
            const disableVariationsId = this.isInvalidMinimumVariations();

            if (hasMinimumVariations && disableVariationsId) {
              document.getElementById(disableVariationsId) &&
                document.getElementById(disableVariationsId).scrollIntoView();
              return;
            }
            this.setState({ cartQuantity: cartQuantity + 1 });
          }}
          increaseDisabled={Utils.isProductSoldOut(selectedProduct || {})}
        />
      </div>
    );
  };

  render() {
    const className = ['aside fixed-wrapper', 'product-detail flex flex-column flex-end'];
    const { t, onlineStoreInfo, selectedProduct, viewAside, show, onToggle } = this.props;
    const { storeName } = onlineStoreInfo || {};
    const { id, _needMore, images, title, description } = selectedProduct || {};
    const { resizeImage } = this.state;
    const descriptionStr = { __html: description };
    const isHaveContent = Utils.removeHtmlTag(description);

    if (show && selectedProduct && id && !_needMore) {
      className.push('active cover');
    }

    return (
      <aside
        ref={ref => (this.asideEl = ref)}
        className={className.join(' ')}
        onClick={e => this.handleHideProductDetail(e)}
        data-heap-name="ordering.home.product-detail.container"
      >
        <div
          className="product-detail__container aside__content flex flex-column cover"
          style={{
            opacity: viewAside === 'PRODUCT_DESCRIPTION' && show && !resizeImage ? 0 : 1,
          }}
        >
          <div className="product-detail__wrapper">
            <IconClose
              className="product-detail__icon-close icon icon__normal margin-normal"
              onClick={() => onToggle()}
              data-heap-name="ordering.home.product-detail.back-btn"
            />

            <div className="product-detail__image-container flex__shrink-fixed">
              {images && images.length > 1 ? (
                <Swiper
                  className="product-detail__image"
                  // slidesPerView={'auto'}
                  pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                  }}
                  callback={this.handleSwipeProductImage.bind(this)}
                >
                  {images.map(image => {
                    return (
                      <SwiperSlide key={image}>
                        <Image
                          src={image}
                          scalingRatioIndex={2}
                          alt={`${storeName} ${title}`}
                          className="product-detail__image-content"
                        />
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              ) : (
                <Image
                  className="product-detail__image-content"
                  src={images && images.length ? images[0] : null}
                  scalingRatioIndex={2}
                  alt={`${storeName} ${title}`}
                />
              )}
            </div>
            <div className="product-detail__info flex flex-top flex-space-between flex__shrink-fixed padding-small">
              <div className="product-detail__info-summary flex  flex-space-between padding-small flex-top">
                <h2 className="product-detail__title text-size-biggest text-weight-bolder">{title}</h2>
                <div className="product-detail__price flex flex-column text-right flex-end">
                  {this.getOriginalDisplayPrice() && (
                    <CurrencyNumber
                      className="text-line-through text-weight-bolder flex__shrink-fixed margin-left-right-smaller"
                      money={this.getOriginalDisplayPrice()}
                      numberOnly={true}
                    />
                  )}
                  <CurrencyNumber
                    className=" text-size-biggest text-weight-bolder flex__shrink-fixed margin-left-right-smaller"
                    money={this.getDisplayPrice()}
                    numberOnly={true}
                  />
                  {Utils.isProductSoldOut(selectedProduct || {}) ? (
                    <Tag
                      text={t('SoldOut')}
                      className="product-detail__info-tag tag tag__default margin-smaller text-size-big flex__shrink-fixed"
                    />
                  ) : null}
                </div>
              </div>
            </div>
            {isHaveContent ? (
              <article className="product-detail__article padding-left-right-small">
                <p
                  className="text-opacity padding-left-right-small text-size-big"
                  dangerouslySetInnerHTML={descriptionStr}
                />
              </article>
            ) : null}
            {this.renderVariations()}
            {this.renderProductLowStock()}
            {this.renderOperatorButton()}
          </div>
          {this.renderProductOperator()}
        </div>
      </aside>
    );
  }
}

ProductDetailDrawer.propTypes = {
  show: PropTypes.bool,
  viewAside: PropTypes.string,
  footerEl: PropTypes.any,
  onToggle: PropTypes.func,
};

ProductDetailDrawer.defaultProps = {
  show: false,
  viewAside: '',
  onToggle: () => {},
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        selectedProduct: getSelectedProductDetail(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(withRouter(ProductDetailDrawer));
