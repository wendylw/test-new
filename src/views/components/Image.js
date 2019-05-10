import React from 'react';
import compressionImage from '../../libs/compress-image';
import placeholder from '../../images/item-placeholder.svg';

class Image extends React.Component {
  el = null;

  componentDidMount = () => {
    // TODO: I have to use className to match all images here, other wise only one placeholder is rendered in a list.
    compressionImage.init('.my-product-image');
	}

	componentDidUpdate = () => {
    compressionImage.init('.my-product-image');
  }
  
  render() {
    const {
			className,
			alt,
			src,
			type,
		} = this.props;

    return (
      <figure
        ref={ref => this.el = ref}
        className={`my-product-image ${className}`}
        data-src={src}
				data-type={type}
      >
        <img src={src || placeholder} alt={alt} />;
      </figure>
    );
  }
}

export default Image;
