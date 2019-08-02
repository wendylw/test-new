import React, { Component } from "react";
import ProductDetail from "../ProductDetail";

class ProductDetailModal extends Component {
  render() {
    const className = ["aside", "aside__product-detail", "active"];
    const { product } = this.props;
    if (!product) {
      return null;
    }
    return (
      <aside className={className.join(" ")} onClick={this.handleClickOverlay}>
        <ProductDetail
          product={product}
          addOrUpdateShoppingCartItem={this.props.addOrUpdateShoppingCartItem}
        />
      </aside>
    );
  }

  handleClickOverlay = e => {
    if (e.target === e.currentTarget) {
      this.props.onHide && this.props.onHide();
    }
  };
}

export default ProductDetailModal;
