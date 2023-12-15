import React from 'react';
import MemberCard from './components/MemberCard';
import CashbackBlock from './components/CashbackBlock';
import PromoList from './components/PromoList';
import MembershipDetailFooter from './components/MembershipDetailFooter';

const MembershipDetail = () => (
  <div>
    <MemberCard />
    <CashbackBlock />
    <PromoList />
    <MembershipDetailFooter />
  </div>
);

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
