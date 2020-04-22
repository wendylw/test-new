import bannerImage from './components/images/Banner.jpg';
import promoBanner from './components/images/PromoBanner.jpg';

// ordered by id DESC
const dataSource = [
  {
    id: 'campaign-1',
    barImage: bannerImage,
    bannerImage: promoBanner,
    subject: "StoreHub x Touch 'n Go eWallet Cashback Offer",
    description: "Order food from any store on Beepit.com and earn RM3 Cashback when you pay via Touch 'n Go eWallet!",
    sections: [
      {
        type: 'campaign_period',
        subject: 'Campaign Period',
        fields: {
          activeDateRange: '21st April 2020 - 30th April 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            "Applicable to all Touch 'n Go eWallet users",
            'Earn RM3 cashback credited to your eWallet when you spend at least RM20 on beepit.com or on businesses on the Beep Delivery platform.',
            'Each user is only entitled to receive the RM3 Cashback once throughout the Promotion Period.',
            'This offer is limited to the first 3,000 transactions. The Promotion will end once there has been 3,000 Transactions carried out or on expiry of the Promotion Period, whichever is earlier.',
          ],
        },
      },
    ],
  },
  {
    id: 'campaign-0',
    barImage: 'https://d24lyus32iwlxh.cloudfront.net/beep/boost-campaign-bar.jpg',
    bannerImage: 'https://d24lyus32iwlxh.cloudfront.net/beep/mvp-promo-banner.jpg',
    subject: 'StoreHub x Boost Cashback Offer',
    description: 'Order food from any store on Beepit.com and earn 10% cashback up to RM5 when you pay via Boost!',
    sections: [
      {
        type: 'campaign_period',
        subject: 'Campaign Period',
        fields: {
          activeDateRange: '8 April 2020 - 31 May 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            'Applicable to all Boost users',
            '10% cashback to be capped at RM5',
            'Each eligible customer may only receive maximum of two (2) cashback transactions under this campaign',
            'This offer is limited to the first 1,000 transactions',
          ],
        },
      },
    ],
  },
];

export default dataSource;
