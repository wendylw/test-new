import React from 'react'

const withSession = TheComponent => class WithSessionComponent extends React.Component {
  state = {};

  componentDidMount = async () => {
    // TODO: call real session info api for sync sessionInfo
    const { sessionId } = await Promise.resolve({ sessionId: 'Qkf6WNhXPgLVHKo1pJTRLvin2OqKTOfb' });
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