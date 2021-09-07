import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../css/AddPatientModal.scss';
import { Button, TextField, Modal } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

class AddPatientModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            name: '',
            healthcareProvider: {},
            ssn: '',
            availableHealthcareProviders: this.props.sessionData.availableHealthcareProviders || [],
            submitted: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.reset = this.reset.bind(this);
        this.onClose = this.onClose.bind(this);

        this.getHealthcareProviders();
    }

    reset() {
        this.setState({
            modalOpen: false,
            name: '',
            healthcareProvider: {},
            ssn: '',
            availableHealthcareProviders: this.props.sessionData.availableHealthcareProviders || [],
            submitted: false,
        });
    }

    handleInputChange(event) {
        const target = event.currentTarget ?? event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            modalOpen: nextProps.modalOpen,
            availableHealthcareProviders: nextProps.sessionData.healthcareProviders,
            submitted: !nextProps.attemptingToSubmitPatient && this.props.attemptingToSubmitPatient,
        }, () => {
            if (this.state.submitted) {
                this.onClose();
            }
        });
    }

    getHealthcareProviders() {
        this.props.dispatch({ type: "GET_HEALTHCARE_PROVIDERS" });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.dispatch({
            type: "ADD_PATIENT",
            payload: {
                name: this.state.name,
                ssn: this.state.ssn,
                healthcareProvider: this.state.healthcareProvider,
            }
        });
    }

    onClose() {
        this.props.onClose();
        this.reset();
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
                onClose={this.onClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className="contents">
                    <form className="form" onSubmit={this.handleSubmit}>
                        <div className="app-title">Add Patient</div>
                        <label>Full name</label>
                        <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} />

                        <label>SSN</label>
                        <input type="text" name="ssn" value={this.state.ssn} onChange={this.handleInputChange} />

                        <label>Health Care Provider</label>
                        <Autocomplete
                            options={this.state.availableHealthcareProviders || []}
                            debug
                            renderInput={(params) => <TextField {...params} variant="outlined" />}
                            onChange={(_, val) => this.setState({ healthcareProvider: val })}
                            getOptionLabel={(option) => option.name || ""}
                        />

                        <Button type="submit" className={'primary ' + (this.props.attemptingToSubmitPatient ? 'disabled' : '')}>
                            {this.props.attemptingToSubmitPatient ? 'Submitting...' : 'Submit'}
                        </Button>
                    </form>
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    sessionData: state.sessionData,
    attemptingToSubmitPatient: state.attemptingToSubmitPatient,
    modalOpen: ownProps.modalOpen,
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(AddPatientModal);