import React, { Component } from 'react';
import './css/App.scss';
import { connect } from 'react-redux';
import { Login, Main } from './components';
import loading from './img/loading.gif';
import { withCookies } from 'react-cookie';

const cookieName = 'vaccinePassportUser';

class App extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    this.props.dispatch({ type: 'LOGOUT' });
  }

  render() {
    const { cookies } = this.props;
    const user = cookies.get('vaccinePassportUser');

    if (this.props.sessionData) {
      if (this.props.sessionData.user && !user) {
        cookies.set('vaccinePassportUser', this.props.sessionData.user)
      }

      if (user || this.props.sessionData.user) {
        if (!this.props.sessionData.user) {
          this.props.sessionData.user = user;
        }

        return (
          <div className="App">
            <header className="App-header">

            </header>
            <div className="main-screen-container">
              <Main />
            </div>
          </div>
        );
      } else {
        return (
          <div className="app">
            <Login cookies={this.props.cookies}/>
          </div>
        );
      }
    } else {
      return (
        <div className="loading">
          <img src={loading} alt="Loading" />
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  initialized: state.initialized,
  sessionData: state.sessionData,
  account: state.account,
  contractState: state.contractState
});

export default connect(mapStateToProps)(withCookies(App));
