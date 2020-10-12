import makanTogetherBanner2 from './components/images/MakanTogetherMalaysiaBanner2.jpg';
import makanTogetherBoard2 from './components/images/MakanTogetherMalaysiaRHBboard2.jpg';

// ordered by id DESC
const dataSource = [
  {
    id: 'campaign-4',
    barImage: makanTogetherBanner2,
    bannerImage: makanTogetherBoard2,
    subject: 'Campaign',
    description: 'Order from 3 different restaurants this week and stand a chance to win a RM30 voucher',
    sections: [
      {
        type: 'campaign_period',
        subject: 'Campaign Period',
        fields: {
          activeDateRange: '7th September - 23rd September 2020',
        },
      },
      {
        type: 'terms_and_conditions',
        subject: 'Terms & conditions',
        fields: {
          conditions: [
            'The winner of the Giveaway Prize for this campaign will get a RM30 Beep cash voucher. The voucher cannot be redeemable or exchangeable for cash.',
            'In order to be eligible for this giveaway, you must purchase from 3 different stores on Beepit.com in seven (7) consecutive days within the Campaign period. ',
            'No minimum spend',
            'Multi-store purchase spend can be accrued across multiple purchases within the seven (7) consecutive days, as long as the seven (7) days fall within the Campaign Period.',
            '100 winners will be selected at random and notified within 3-5 working days following the end of the Campaign Period.',
            'Winners will be notified via SMS and be instructed on how to claim their giveaway prize.',
            'This #MakanTogetherMalaysia giveaway is organised by StoreHub and is open to everyone in Malaysia.',
            'Prize forfeit date: 30th September 2020',
            'StoreHub reserves the right to cancel or amend the contest and these terms and conditions without notice in the event of a catastrophe, war, civil or military disturbance, act of God or any actual or anticipated breach of any applicable law or regulation or any other event outside of the promoter’s control.',
            'StoreHub is not responsible for inaccurate details supplied by the winners.',
            "StoreHub's decision in respect of all matters to do with the giveaway will be final and no correspondence will be entered into.",
            'StoreHub is not obliged to give any reasons for its decision, and will not engage in any conversation or correspondence with any person regarding its decision.',
            'By entering this giveaway, you are indicating your agreement to be bound by these terms and conditions.',
          ],
        },
      },
    ],
  },
];

export default dataSource;
