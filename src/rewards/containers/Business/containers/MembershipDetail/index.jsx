import React from 'react';
import MemberCard from './components/MemberCard';
import CashbackBlock from './components/CashbackBlock';
import PromoList from './components/PromoList';
import MembershipDetailFooter from './components/MembershipDetailFooter';

const MembershipDetail = () => (
  <>
    <MemberCard />
    <CashbackBlock />
    <PromoList />
    <MembershipDetailFooter />
  </>
);

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
