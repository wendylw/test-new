import React, { Component } from "react";
import { compose, graphql } from "react-apollo";
import withProducts from "../libs/withProducts";
import withOnlineStoreInfo from "../libs/withOnlineStoreInfo";
import gql from "graphql-tag";
import CurrencyNumber from "../components/CurrencyNumber";
import withLocalState from "../libs/withLocalState";

const CountsContainer = withLocalState(
  ({ localState }) => (
    <span>{`${localState.counts} when ${localState.countsUpdatedAt}`}</span>
  )
);

class Page2 extends Component {
  handleCountClick = () => {
    const { toggleCounts } = this.props;
    toggleCounts();
  };

  render() {
    console.log('Page2 render()');
    const { gqlProducts, gqlOnlineStoreInfo } = this.props;
    const { products, loading: loading1 } = gqlProducts;
    const { onlineStoreInfo, loading: loading2 } = gqlOnlineStoreInfo;

    if (loading1 || loading2) {
      return <div>loading..</div>;
    }

    console.log('gqlOnlineStoreInfo => %o', gqlOnlineStoreInfo);

    if (!products || !onlineStoreInfo) {
      return null;
    }

    // See more query examples: https://www.apollographql.com/docs/react/essentials/queries
    // Manually Query: https://www.apollographql.com/docs/react/essentials/queries#manual-query
    return (
      <div className="Page2">
        <h1>Page2</h1>

        <h3>Counter</h3>
        <div>
          <button type="button" onClick={this.handleCountClick}>Click +1</button>
          {' -> '}
          <CountsContainer />
        </div>

        <h3>Products</h3>
        <table>
          <tbody>
          {
            products.productlist.map(({ id, title, displayPrice }) => (
              <tr key={id}>
                <td>{title}</td>
                <td><CurrencyNumber money={displayPrice} /></td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
    );
  }
}

const withToggleCounts = graphql(gql`
  mutation {
    toggleCounts @client
  }
`, { name: 'toggleCounts' });

export default compose(withProducts, withOnlineStoreInfo, withToggleCounts)(Page2);
