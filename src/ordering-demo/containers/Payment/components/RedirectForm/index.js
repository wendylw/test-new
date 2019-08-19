import React from 'react';

const HiddenInput = ({ name, value }) => (
  <input name={name} value={value} hidden readOnly />
);

class RedirectForm extends React.Component {
  form = null;

  componentDidMount() {
    this.form.submit();
  }

  getFields = () => {
    const { data } = this.props;
    return Object.keys(data).map(name => ({
      name,
      value: data[name]
    }))
  }

  render() {
    const { action, method } = this.props;
    return (
      <form ref={ref => { this.form = ref }} action={action} method={method}>
        {
          this.getFields().map(field => (
            <HiddenInput key={field.name} name={field.name} value={field.value} />
          ))
        }
      </form>
    );
  }
}

export default RedirectForm;
