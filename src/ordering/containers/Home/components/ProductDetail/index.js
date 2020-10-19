import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withTranslation } from 'react-i18next';
import Swipe, { SwipeItem } from 'swipejs/react';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';
import VariationSelector from '../VariationSelector';
import ProductItem from '../../../../components/ProductItem';
import { IconClose } from '../../../../../components/Icons';
import ItemOperator from '../../../../../components/ItemOperator';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import config from '../../../../../config';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getProductById } from '../../../../../redux/modules/entities/products';
import { actions as homeActionCreators, getCurrentProduct } from '../../../../redux/modules/home';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import qs from 'qs';
import { withRouter } from 'react-router-dom';
import './ProductDetail.scss';

const VARIATION_TYPES = {
  SINGLE_CHOICE: 'SingleChoice',
  MULTIPLE_CHOICE: 'MultipleChoice',
};
const EXECLUDE_KEYS = ['variationType'];

class ProductDetail extends Component {
  currentProductId = null;
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
  };

  componentDidMount() {
    const { product } = this.props;

    this.initVariationsByIdMap(product);

    if (this.swipeEl) {
      this.swipeEl.stop();
    }

    this.initMinimumVariationList();
  }

  componentDidUpdate(prevProps, prevState) {
    const { show, product } = this.props;
    const { variations, id } = product || {};

    if (!id || !variations) {
      return;
    }

    if ((!prevProps.product && id) || id !== prevProps.product.id || (show && prevProps.show !== show)) {
      this.initVariationsByIdMap(product);
      this.initMinimumVariationList();
    }

    if (!show && prevProps.show !== show) {
      this.setState({
        resizedImage: false,
        minimumVariations: [],
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

    this.currentProductId = product.id;

    this.setState({
      variationsByIdMap: newMap,
      cartQuantity: Constants.ADD_TO_CART_MIN_QUANTITY,
    });
  }

  initMinimumVariationList() {
    const { product } = this.props;
    const { variations } = product || {};
    var minimumVariations = (variations || []).filter(v => v.enableSelectionAmountLimit && v.minSelectionAmount);

    if (minimumVariations && minimumVariations.length) {
      this.setState({ minimumVariations });
    }
  }

  displayPrice() {
    const { product } = this.props;
    const { childrenMap, unitPrice = 0, onlineUnitPrice = 0, displayPrice = 0 } = product || {};
    const { variationsByIdMap } = this.state;
    const selectedValues = [];
    const selectedVariations = [];
    let totalPriceDiff = 0;

    Object.values(variationsByIdMap).forEach(function(options) {
      Object.values(options).forEach(item => {
        if (item.value) {
          selectedVariations.push(item);

          totalPriceDiff += item.priceDiff;
          selectedValues.push(item.value);
        }
      });
    });

    const childProduct = (childrenMap || []).find(({ variation }) => variation.every(v => selectedValues.includes(v)));

    if (childProduct) {
      this.currentProductId = childProduct.childId;

      childProduct.variation.forEach(cv => {
        totalPriceDiff -= selectedVariations.find(sv => sv.value === cv).priceDiff;
      });

      return childProduct.displayPrice + totalPriceDiff;
    }

    const price = displayPrice || unitPrice || onlineUnitPrice;

    return (price + totalPriceDiff).toFixed(2);
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
      return true;
    }

    for (let i = 0; i < minimumVariations.length; i++) {
      const { id, minSelectionAmount } = minimumVariations[i];

      if (
        !variationsByIdMap[id] ||
        (variationsByIdMap[id] && Object.keys(variationsByIdMap[id]).length - 1 < minSelectionAmount)
      ) {
        return true;
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

    this.setState({ variationsByIdMap: newMap });
  }

  getChoiceVariations(type) {
    const { variations } = this.props.product || {};

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
    });
  }

  handleHideProductDetail(e) {
    if (e && e.target !== e.currentTarget) {
      return;
    }

    this.closeModal();
  }

  handleGtmEventTracking = variables => {
    const { product } = this.props;
    let selectedProduct = product.childrenMap.find(child => child.childId === variables.productId);

    if (!selectedProduct) {
      selectedProduct = product;
    }

    const gtmEventData = {
      product_name: product.title,
      product_id: variables.productId,
      price_local: selectedProduct.displayPrice,
      variant: variables.variations,
      quantity: selectedProduct.quantityOnHand,
      product_type: product.inventoryType,
      Inventory: !!product.markedSoldOut ? 'In stock' : 'Out of stock',
      image_count: (product.images && product.images.length) || 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventData);
  };

  handleAddOrUpdateShoppingCartItem = async variables => {
    const { homeActions } = this.props;

    this.handleGtmEventTracking(variables);

    await homeActions.addOrUpdateShoppingCartItem(variables);
    await homeActions.loadShoppingCart();
    this.handleHideProductDetail();
  };

  handleSwipeProductImage(index) {
    window.heap?.track('ordering.home.product-detail-swipe', { ImageIndex: index });
    this.setState({ currentProductDescriptionImageIndex: index });
  }

  handleDescriptionAddOrShowDescription = async product => {
    const { onToggle, homeActions } = this.props;
    const { variations } = product;

    const { history } = this.props;
    const { storeId } = config;

    let deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    const search = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const { h } = search;

    if ((!deliveryAddress && Utils.isDeliveryType()) || !storeId || !h) {
      const { search } = window.location;
      const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
        search: `${search}&callbackUrl=${callbackUrl}`,
      });
      return;
    }

    if (!variations || !variations.length) {
      await homeActions.addOrUpdateShoppingCartItem({
        action: 'add',
        business: config.business,
        productId: product.id,
        quantity: Constants.ADD_TO_CART_MIN_QUANTITY,
        variations: [],
      });
      await homeActions.loadShoppingCart();
      this.closeModal();

      return;
    } else {
      homeActions.loadProductDetail(product);
    }

    this.setState({ resizedImage: true });

    this.descriptionTimeOut = setTimeout(() => {
      onToggle('PRODUCT_DETAIL');

      clearTimeout(this.descriptionTimeOut);
    }, 550);
  };

  renderVariations() {
    const { show } = this.props;
    const { variations } = this.props.product || {};

    if (!variations || !variations.length) {
      return null;
    }

    const singleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.SINGLE_CHOICE);
    const multipleChoiceVariations = this.getChoiceVariations(VARIATION_TYPES.MULTIPLE_CHOICE);

    return (
      <div className="product-detail__variations border__bottom-divider">
        <ol className="padding-top-bottom-small">
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
              isInvalidMinimum={this.isInvalidMinimumVariations()}
              data-heap-name="ordering.home.product-detail.multi-choice"
              data-heap-variation-name={variation.name}
              onChange={this.setVariationsByIdMap.bind(this)}
            />
          ))}
        </ol>
      </div>
    );
  }

  renderProductOperator() {
    const { t, product } = this.props;
    const { cartQuantity, minimumVariations } = this.state;
    const { id: productId, images, title } = product || {};
    const imageUrl = Array.isArray(images) ? images[0] : null;
    const hasMinimumVariations = minimumVariations && minimumVariations.length;

    if (!product) {
      return null;
    }

    return (
      <div ref={ref => (this.productEl = ref)} className="product-detail__operator">
        <ProductItem
          isLazyLoad={false}
          productDetailImageRef={ref => (this.productDetailImage = ref)}
          className="product-detail__item"
          image={imageUrl}
          title={title}
          variation={this.getVariationText()}
          price={Number(this.displayPrice())}
          cartQuantity={cartQuantity}
          decreaseDisabled={cartQuantity === 1}
          onDecrease={() => this.setState({ cartQuantity: cartQuantity - 1 })}
          onIncrease={() => this.setState({ cartQuantity: cartQuantity + 1 })}
        />

        <div ref={ref => (this.buttonEl = ref)} className="padding-normal">
          <button
            className="button button__fill button__block text-weight-bolder"
            type="button"
            data-testid="OK"
            data-heap-name="ordering.home.product-detail.ok-btn"
            disabled={
              !this.isSubmitable() ||
              Utils.isProductSoldOut(product || {}) ||
              (hasMinimumVariations && this.isInvalidMinimumVariations())
            }
            onClick={async () => {
              const { variationsByIdMap } = this.state;
              let variations = [];

              Object.keys(variationsByIdMap).forEach(function(variationId) {
                Object.keys(variationsByIdMap[variationId]).forEach(key => {
                  if (!EXECLUDE_KEYS.includes(key)) {
                    variations.push({
                      variationId,
                      optionId: key,
                    });
                  }
                });
              });

              if (this.isSubmitable()) {
                this.handleAddOrUpdateShoppingCartItem({
                  action: 'add',
                  business: config.business,
                  productId: this.currentProductId || productId,
                  quantity: cartQuantity,
                  variations,
                });
              }
            }}
          >
            {t('OK')}
          </button>
        </div>
      </div>
    );
  }

  renderProductDescription() {
    const { t, show, product, viewAside, onToggle, onlineStoreInfo } = this.props;
    const { currentProductDescriptionImageIndex } = this.state;
    const { images, title, description } = product || {};
    const { storeName } = onlineStoreInfo || {};
    const className = ['product-description__container aside__content absolute-wrapper flex flex-column'];
    const descriptionStr = { __html: Utils.removeHtmlTag(description) };

    if (viewAside !== 'PRODUCT_DESCRIPTION' && show) {
      className.push('product-description__hide');
    }

    return (
      <div className={className.join(' ')}>
        <div
          ref={ref => (this.productDescriptionImage = ref)}
          className="product-description__image-container flex__shrink-fixed"
        >
          <IconClose
            className="product-description__icon-close icon icon__normal margin-normal"
            onClick={() => onToggle()}
            data-heap-name="ordering.home.product-detail.back-btn"
          />
          {images && images.length > 1 ? (
            <Swipe
              ref={ref => (this.swipeEl = ref)}
              continuous={images.length > 2 ? true : false}
              callback={this.handleSwipeProductImage.bind(this)}
            >
              {images.map((imageItemUrl, key) => {
                return (
                  <SwipeItem key={`swipe-${key}`}>
                    <Image
                      className="product-description__single-image"
                      src={imageItemUrl}
                      scalingRatioIndex={2}
                      alt={`${storeName} ${title}`}
                    />
                  </SwipeItem>
                );
              })}
            </Swipe>
          ) : (
            <Image
              className="product-description__single-image"
              src={images && images.length ? images[0] : null}
              scalingRatioIndex={2}
              alt={`${storeName} ${title}`}
            />
          )}
          {images && images.length > 1 ? (
            <ul className="product-description__dot-list text-center padding-top-bottom-smaller">
              {images.map((imageItemUrl, key) => {
                const dotClassList = ['product-description__dot'];

                if (key === currentProductDescriptionImageIndex) {
                  dotClassList.push('active');
                }

                return <li key={`swipe-${key}-dot`} className={dotClassList.join(' ')}></li>;
              })}
            </ul>
          ) : null}
        </div>
        <div className="product-description__info flex flex-top flex-space-between flex__shrink-fixed padding-small border__bottom-divider">
          <summary className="product-description__info-summary flex flex-column flex-space-between">
            <h2 className="product-description__info-title padding-small text-size-biggest text-weight-bolder ">
              {title}
            </h2>
            <CurrencyNumber
              className="padding-small text-size-big text-opacity text-weight-bolder"
              money={Number(this.displayPrice()) || 0}
            />
          </summary>

          {Utils.isProductSoldOut(product || {}) ? (
            <Tag
              text={t('SoldOut')}
              className="product-description__info-tag tag tag__default margin-normal text-size-big flex__shrink-fixed"
            />
          ) : (
            <ItemOperator
              className="flex-middle flex__shrink-fixed margin-smaller"
              decreaseDisabled={false}
              data-heap-name="ordering.home.product-detail.item-adjuster"
              onIncrease={this.handleDescriptionAddOrShowDescription.bind(this, product)}
            />
          )}
        </div>
        <article className="product-description__article margin-top-bottom-normal">
          {Boolean(descriptionStr) ? (
            <p
              className="text-opacity padding-left-right-normal margin-top-bottom-small"
              dangerouslySetInnerHTML={descriptionStr}
            />
          ) : (
            <p className="text-opacity padding-left-right-normal margin-top-bottom-small">
              {t('NoProductDescription')}
            </p>
          )}
        </article>
      </div>
    );
  }

  render() {
    const className = ['aside fixed-wrapper', 'product-detail flex flex-column flex-end'];
    const { product, viewAside, show, footerEl } = this.props;
    const { resizeImage } = this.state;

    if (show && product && product.id && !product._needMore) {
      className.push('active');
    }

    return (
      <aside
        ref={ref => (this.asideEl = ref)}
        className={className.join(' ')}
        onClick={e => this.handleHideProductDetail(e)}
        data-heap-name="ordering.home.product-detail.container"
        style={{
          bottom: footerEl ? `${footerEl.clientHeight || footerEl.offsetHeight}px` : '0',
        }}
      >
        <div
          className="product-detail__container aside__content absolute-wrapper flex flex-column"
          style={{
            opacity: viewAside === 'PRODUCT_DESCRIPTION' && show && !resizeImage ? 0 : 1,
          }}
        >
          {this.renderVariations()}
          {this.renderProductOperator()}
        </div>
        {this.renderProductDescription()}
      </aside>
    );
  }
}

ProductDetail.propTypes = {
  show: PropTypes.bool,
  viewAside: PropTypes.string,
  footerEl: PropTypes.any,
  onToggle: PropTypes.func,
};

ProductDetail.defaultProps = {
  show: false,
  viewAside: '',
  onToggle: () => {},
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      const currentProductInfo = getCurrentProduct(state);

      return {
        product: getProductById(state, currentProductInfo.id),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(ProductDetail));
