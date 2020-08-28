import bannerImage from './components/images/Banner.jpg';
import promoBanner from './components/images/PromoBanner.jpg';
import rhbBanner from './components/images/RHBbanner@2x.jpg';
import rhbBoard from './components/images/RHBboard@2x.jpg';
import makanTogetherBoard from './components/images/MakanTogetherMalaysiaRHBboard.jpg';
import makanTogetherBanner from './components/images/MakanTogetherMalaysiaBanner.jpg';

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
          activeDateRange: '23 April 2020 - 8 May 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            "Applicable to all Touch 'n Go eWallet users",
            "The RM3 Cashback will be credited back to the eligible Touch 'n Go eWallet user's account within three(3) working days from the transaction date.",
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
  {
    id: 'campaign-2',
    barImage: rhbBanner,
    bannerImage: rhbBoard,
    subject: 'Beep x RHB Credit Card/-i Cashback Offer',
    description:
      'Spend at least RM30 from any store on Beepit.com and earn RM5 cashback when you pay with your RHB Credit Card/-i account!',
    sections: [
      {
        type: 'campaign_period',
        subject: 'Campaign Period',
        fields: {
          activeDateRange: '15th June 2020 - 14th September 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            'Applicable to payments made using RHB Credit Card/-i only.',
            'To qualify, a minimum spend of RM30 on total net purchase price in a single receipt (exclusive of delivery charges) is required to earn the RM5 cashback (Promotion).',
            'The cashback under this Promotion will be credited into the RHB Credit Card/-i account within four (4) to six (6) weeks after each month during the Promotion Period and will be reflected in the next monthly statement.',
            'The Promotion is limited to two thousand (2,000) cashback claims per month to eligible cardholders on a first-come-first-serve basis during the Promotion Period.',
            'Promotion terms and conditions apply.',
            'RHB general terms and conditions apply.',
          ],
        },
      },
    ],
  },
  {
    id: 'campaign-3',
    barImage: makanTogetherBanner,
    bannerImage: makanTogetherBoard,
    subject: '#MakanTogetherMalaysia Giveaway',
    sections: [
      {
        type: 'campaign_period',
        subject: 'Campaign Period',
        fields: {
          activeDateRange: '24th August 2020 - 6th September 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            'This giveaway is only applicable to purchases made on beepit.com.',
            'In order to be eligible for this promotion, you must spend the set promo amount within the promotional timeframe.',
            'The Giveaway includes: Spend more than RM250 within a frame of 7 days and stand a chance to win a RM25 beepit.com voucher.',
            'Winners will be selected at random within the campaign period.',
            'Winners will be notified 3-5 working days following the last date of the promotion.',
            'Winners will be notified via SMS and the next steps of claiming the vouchers will be explained.',
          ],
        },
      },
    ],
  },
];

export default dataSource;
