import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, TextField } from '@material-ui/core';
import '../css/Login.scss';
import { Autocomplete } from '@material-ui/lab';


class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: this.props.sessionData.username || '',
            password: this.props.sessionData.password || '',
            contractAddress: this.props.contractAddress || '',
            action: this.props.action || '',
            healthcareProvider: this.props.healthcareProvider || '',
            isHealthcareProvider: this.props.isHealthcareProvider || '',
            availableHealthcareProviders: this.props.sessionData.healthcareProviders || [],
        };

        this.handleActionChange = this.handleActionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getHealthcareProviders();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            availableHealthcareProviders: nextProps.sessionData.healthcareProviders,
        })
    }

    getHealthcareProviders() {
        this.props.dispatch({ type: "GET_HEALTHCARE_PROVIDERS" });
    }

    handleInputChange(event) {
        const target = event.currentTarget ?? event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // If this input changes, then the user is toggling between views and the error message
        // needs to be reset
        if (name === 'action' && ['LOGIN', 'REGISTER'].includes(value)) {
            delete this.props.sessionData.loggedIn;
            delete this.props.sessionData.registered;
        }

        this.setState({ [name]: value });
    }

    handleActionChange(event) {
        this.setState({ action: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.dispatch({
            type: this.state.action,
            payload: {
                username: this.state.username,
                contractAddress: this.state.contractAddress,
                password: this.state.password,
                isHealthcareProvider: this.state.isHealthcareProvider,
                healthcareProvider: this.state.healthcareProvider,
            }
        });
    }

    renderSubmitButton(action) {
        switch (action) {
            case 'LOGIN':
                return this.props.attemptingToLogin ? 'Logging in...' : 'Login';
            case 'REGISTER':
                return this.props.attemptingToRegister ? 'Registering...' : 'Register';
            default:
                break
        }
    }

    render() {
        return (
            <div className="container">
                <div className="app-title">Vaccine Passports</div>

                <div>
                    <Button value="LOGIN" name="action" className='login-button' onClick={this.handleInputChange}>Login</Button>
                    <Button value="REGISTER" name="action" className='login-button' onClick={this.handleInputChange}>Register</Button>
                </div>

                {(this.state.action) &&
                    <form className="form" onSubmit={this.handleSubmit}>
                        {this.props.sessionData.loggedIn === false &&
                            <div className="login-error">Login Failed</div>
                        }
                        {this.props.sessionData.registered === false &&
                            <div className="login-error">Registration Failed</div>
                        }
                        {this.props.sessionData.registered === true &&
                            <div className="login-success">Registration Successful</div>
                        }
                        <label>Username</label>
                        <input type="text" name="username" className="form-input" value={this.state.username} onChange={this.handleInputChange} />

                        <label>Password</label>
                        <input type="password" name="password" className="form-input" value={this.state.password} onChange={this.handleInputChange} />

                        {this.state.action === 'LOGIN' &&
                            <div className="flex-column">
                                <label>Contract Address <span className="optional-label">(Optional)</span></label>
                                <input type="text" name="contractAddress" className="form-input" value={this.state.contractAddress} onChange={this.handleInputChange} />
                            </div>
                        }

                        {this.state.action === 'REGISTER' &&
                            <label> Health Care Provider?
                                <input name="isHealthcareProvider" type="checkbox" checked={this.state.isHealthcareProvider} onChange={this.handleInputChange} />
                            </label>
                        }

                        {(this.state.action) === 'REGISTER' && this.state.isHealthcareProvider &&
                            <Autocomplete
                                options={this.state.availableHealthcareProviders}
                                debug
                                renderInput={(params) => <TextField {...params} variant="outlined" />}
                                onChange={(event, val) => this.setState({ healthcareProvider: val })}
                                getOptionLabel={(option) => option.name || ""}
                            />
                        }

                        <Button type="submit" className={'button ' + (this.props.attemptingToConnect || this.props.attemptingToRegister ? 'disabled' : '')}>
                            {this.renderSubmitButton(this.state.action)}
                        </Button>
                    </form>
                }
            </div>);
    }
}

const mapStateToProps = (state, ownProps) => ({
    sounds: state.sounds,
    sessionData: state.sessionData,
    // loggedIn in sessionData means the user is attempting to login in
    // if registered does not exist or is false, then the user is still in the registering phase
    action: 'loggedIn' in state.sessionData || state.sessionData.registered ? 'LOGIN' : (state.sessionData.registered === false && 'REGISTER'),
    attemptingToConnect: state.attemptingToConnect,
    attemptingToRegister: state.attemptingToRegister,
    cookies: ownProps.cookies
});

export default connect(mapStateToProps)(Login);