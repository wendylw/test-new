import React from "react";
import DocumentTitle from "../components/DocumentTitle";
import Constants from "../utils/constants";

export default () =>
  <DocumentTitle title={Constants.DOCUMENT_TITLE.NOT_FOUND}>
    <div className="NotFound">
      <h3>Sorry, page not found!</h3>
    </div>
  </DocumentTitle>;
