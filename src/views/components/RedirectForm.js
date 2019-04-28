import React from 'react'

const HiddenInput = ({ name, value }) => (
  <input name={name} value={value} hidden readOnly />
);

class RedirectForm extends React.Component {
  form = null;

  componentDidUpdate() {
    this.fire();
  }

  componentDidMount() {
    this.fire();
  }

  fire() {
    const { fire = false } = this.props;

    if (fire) {
      console.log(this.form);
      this.form.submit();
    }
  }

  render() {
    const { action, method, fields } = this.props;
    let formFields = fields;

    if (typeof formFields === 'function') {
      formFields = formFields();
    }

    if (!Array.isArray(formFields) || !action || !method) {
      return null;
    }

    return (
      <form ref={ref => {this.form = ref}} action={action} method={method}>
        {formFields.map(field => <HiddenInput key={field.name} name={field.name} value={field.value} />)}
      </form>
    );
  }
}

export default RedirectForm;
