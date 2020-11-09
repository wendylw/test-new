import React from 'react';
import { withTranslation } from 'react-i18next';
import config from '../../../config';

// TODO: remove?
class JumpMenu extends React.Component {
  state = {
    url: '',
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    // make auto redirect once store is closed
    const { shippingType, pickupUrl, deliveryUrl } = this.props;
    if ((deliveryUrl || pickupUrl) && !this.state.url) {
      this.setState(
        {
          url: shippingType === 'pickup' ? pickupUrl : deliveryUrl,
        },
        () => {
          this.submit(); // the form uses real url, not the one empty
        }
      );
    }
  }

  submit = () => {
    const { business, deliveryAddress } = this.props;
    const { url } = this.state;
    let form = document.createElement('form');
    let input1 = document.createElement('input');
    let input2 = document.createElement('input');

    form.action = config.beepOnlineStoreUrl(business) + '/go2page';
    form.method = 'POST';

    input1.name = 'target';
    input1.value = url;
    form.appendChild(input1);

    input2.name = 'deliveryAddress';
    input2.value = JSON.stringify(deliveryAddress);
    form.appendChild(input2);

    document.body.append(form);
    form.submit();
  };

  render() {
    return <div></div>;
  }
}

export default withTranslation()(JumpMenu);
