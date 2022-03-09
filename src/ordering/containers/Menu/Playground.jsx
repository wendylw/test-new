import React from 'react';
import Frame from '../../../common/components/Frame';
import PromotionContent from './components/PromotionBar/PromotionContent';

const promotionsMock = [
  {
    id: '616fe323015379546c62ac57',
    promotionCode: 'FULLSH',
    discountType: 'percentage',
    discountValue: 100,
    appliedSources: [8, 7],
    appliedClientTypes: ['app', 'web', 'tngMiniProgram'],
    formattedDiscountValue: 'RM 100.00',
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    requireFirstPurchase: false,
    discountProductList: ['product1', 'product2'],
    validDate: '2022-2-22',
  },
  {
    id: '6170dab26277d221b25fadf9',
    promotionCode: 'HALFSH',
    discountType: 'percentage',
    discountValue: 50,
    appliedSources: [6, 7, 8, 5],
    appliedClientTypes: ['web', 'app', 'tngMiniProgram'],
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    requireFirstPurchase: false,
    validDate: '2022-2-22',
  },
  {
    id: '5ea2bf064157ca000793933b',
    promotionCode: '8888',
    discountType: 'percentage',
    discountValue: 80,
    appliedSources: [6, 5, 7, 8],
    appliedClientTypes: ['web', 'app'],
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    requireFirstPurchase: false,
  },
  {
    id: '5fa921b9b5573c00063610ca',
    promotionCode: '66666',
    discountType: 'absolute',
    discountValue: 20,
    appliedSources: [6, 5],
    appliedClientTypes: ['web', 'app'],
    maxDiscountAmount: 0,
    minOrderAmount: 100,
    requireFirstPurchase: false,
  },
  {
    id: '5efd5c042466700006ad1ab1',
    promotionCode: '999',
    discountType: 'freeShipping',
    discountValue: 0,
    appliedSources: [6, 5, 7, 8],
    appliedClientTypes: ['web', 'app'],
    maxDiscountAmount: 100,
    minOrderAmount: 0,
    requireFirstPurchase: false,
  },
  {
    id: '1',
    promotionCode: '999',
    discountType: 'aaa',
    discountValue: 0,
    appliedSources: [6, 5, 7, 8],
    appliedClientTypes: ['web', 'app'],
    maxDiscountAmount: 100,
    minOrderAmount: 200,
    requireFirstPurchase: false,
  },
  {
    id: '11',
    promotionCode: 'FREEDEL',
    discountType: 'aaa',
    discountValue: 0,
    appliedSources: [6, 5, 7, 8],
    appliedClientTypes: ['web', 'app'],
    maxDiscountAmount: 100,
    minOrderAmount: 200,
    requireFirstPurchase: false,
  },
];

const Playground = props => {
  const promotions = promotionsMock;
  return (
    <Frame>
      {promotions.map(promotion => (
        <div className="tw-m-8px">
          <PromotionContent promotion={promotion} singleLine />
        </div>
      ))}
    </Frame>
  );
};
Playground.displayName = 'Playground';

export default Playground;
