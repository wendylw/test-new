/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { withRouter } from "react-router";
import { compose } from 'react-apollo';
import MainTop from '../views/components/MainTop';
import MainBody from '../views/components/MainBody';
import FooterOperation from '../views/components/FooterOperation';
import Constants from '../Constants';
import ProductDetails from '../views/components/ProductDetails';
import ProductsEditCart from '../views/components/ProductsEditCart';
import MainMenu from '../views/components/MainMenu';
import DocumentTitle from '../views/components/DocumentTitle';

export class Home extends Component {
  state = {
    asidesStatus: {
      menu: false,
      edit: false,
      product: false,
    },
    loaded: false,
    activeProduct: {},
    currentAside: null,
  };

  componentDidMount() {
    this.setState({
      loaded: true
    });
  }

  handleAsideClick(e) {
    if (e.target === e.currentTarget) {
      this.hideAside();
    }
  }

  handleToggleAside(options) {
    const { asidesStatus } = this.state;
    const newStatus = {
      menu: false,
      edit: false,
      product: false,
    };

    newStatus[options.asideName] = !asidesStatus[options.asideName];
    this.setState({
      asidesStatus: newStatus,
      activeProduct: options.product || {},
      currentAside: options.asideName
    });
  }

  render() {
    const { match } = this.props;
    const {
      loaded,
      currentAside,
      asidesStatus,
      activeProduct,
    } = this.state;
    const hideClassName = [
      Constants.ROUTER_PATHS.HOME,
      Constants.ROUTER_PATHS.PORDUCTS,
    ].includes(match.path) ? '' : 'hide';

    return (
      <DocumentTitle title={Constants.DOCUMENT_TITLE.HOME}>
        <section id="table-ordering-home" className={`table-ordering__home ${hideClassName}`}>
          <MainTop ref={ref => this.header = ref} />
          <MainBody toggleAside={this.handleToggleAside.bind(this)} />

          {
            loaded
              ? (
                <ProductDetails
                  active={asidesStatus.product}
                  currentAside={currentAside}
                  productId={activeProduct.id}
                  toggleAside={this.handleToggleAside.bind(this)}
                />
              )
              : null
          }

          {
            loaded
              ? (
                <ProductsEditCart
                  active={asidesStatus.edit}
                  toggleAside={this.handleToggleAside.bind(this)}
                />
              )
              : null
          }

          {
            loaded
              ? (
                <MainMenu
                  active={asidesStatus.menu}
                  toggleAside={this.handleToggleAside.bind(this)}
                />
              )
              : null
          }

          <FooterOperation toggleAside={this.handleToggleAside.bind(this)} />
        </section>
      </DocumentTitle>
    )
  }
}

export default compose(
  withRouter,
)(Home);
