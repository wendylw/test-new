/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { compose, graphql } from "react-apollo";
import { Route, withRouter } from "react-router-dom";
import withCategory from "../libs/withCategory";
import apiGql from "../apiGql";
import withLocalState from "../libs/withLocalState";

const CategoryListComponent = ({
  localState,
  gqlOnlineCategory,
  setCurrentCategory,
}) => {
  const style = {
    container: {
      width: '30%',
    },
    selectedCategory: {
      color: 'red',
    }
  };

  const { onlineCategory, loading } = gqlOnlineCategory || {};

  console.log('localState => %o', localState);

  if (loading || !onlineCategory) {
    return <div>loading..</div>;
  }

  console.log(onlineCategory);

  return (
    <div style={style.container}>
      <div>category list</div>
      {
        onlineCategory
          .filter(category => category.isEnabled)
          .map(category => (
            <div key={category.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentCategory({
                    variables: { category },
                  });
                }}
                style={(
                  (localState.currentCategory && localState.currentCategory.id === category.id)
                    ? style.selectedCategory
                    : null
                )}
              >{category.name}</a>
            </div>
          ))
      }
    </div>
  );
};

const CategoryList = compose(
  withLocalState,
  withCategory,
  withRouter,
  graphql(apiGql.SET_CURRENT_CATEGORY, {
    name: 'setCurrentCategory',
  }),
)(CategoryListComponent);

export default class Home extends Component {
  render() {
    return (
      <div className="Home">
        <CategoryList />
        <Route path={`/categories/:id`} exact component={({ match }) => {
          console.debug('match => %o', match);
          return (
            <div>{match.params.id}</div>
          );
        }} />
      </div>
    );
  }
}
