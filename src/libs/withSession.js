import React from 'react'

const withSession = TheComponent => class WithSessionComponent extends React.Component {
  state = {};

  componentDidMount = async () => {
    // TODO: call real session info api for sync sessionInfo
    const { sessionId } = await Promise.resolve({ sessionId: '91gmEKMS3TF5ycvbaRaFJhmCrdgfQPrh' });
    this.setState({ sessionId });
  };

  render() {
    const { children, ...props } = this.props;

    return (
      <TheComponent {...props} sessionId={this.state.sessionId}>{children}</TheComponent>
    );
  }
};

export default withSession;