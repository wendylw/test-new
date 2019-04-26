import React from 'react';
import PageHeaderBar from './PageHeaderBar';
import PageFooterBar from './PageFooterBar';
import PageSideMenu from './PageSideMenu';

const MainLayout = ({ children }) => (
  <React.Fragment>
    <PageHeaderBar />
    <PageSideMenu />
    {children}
    <PageFooterBar />
  </React.Fragment>
);

export default MainLayout;
