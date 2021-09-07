import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../css/AddDoseModal.scss';
import { Button, TextField, Modal } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

class AddDoseModal extends Component {
    constructor(props) {
        super(props);

        console.log(this.props)

        this.state = {
            modalOpen: false,
            submitted: false,
            patient: this.props.patient || {},
            availableVaccineManufacturers: this.props.sessionData.vaccineManufacturers || [],
            lotNumber: '',
            vaccineManufacturer: '',
            date: '',
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.reset = this.reset.bind(this);
        this.onClose = this.onClose.bind(this);
        this.getVaccineManufacturers = this.getVaccineManufacturers.bind(this);

        this.getVaccineManufacturers();
    }

    reset() {
        this.setState({
            modalOpen: false,
            submitted: false,
            patient: this.props.patient || {},
            lotNumber: '',
            vaccineManufacturer: '',
            date: '',
        });
    }

    getVaccineManufacturers() {
        this.props.dispatch({ type: "GET_VACCINE_MANUFACTURERS" });
    }

    handleInputChange(event) {
        const target = event.currentTarget ?? event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            patient: nextProps.patient,
            modalOpen: nextProps.modalOpen,
            submitted: !nextProps.attemptingToSubmitVaccination && this.props.attemptingToSubmitVaccination,
            availableVaccineManufacturers: nextProps.sessionData.vaccineManufacturers,
        }, () => {
            if (this.state.submitted) {
                this.onClose();
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.dispatch({
            type: "ADD_VACCINATION",
            payload: {
                patient: this.props.patient,
                vaccineManufacturer: this.state.vaccineManufacturer,
                date: this.state.date,
                lotNumber: this.state.lotNumber,
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
                        <div className="app-title">Patient Vaccination</div>

                        <label>Lot Number</label>
                        <input type="text" name="lotNumber" value={this.state.lotNumber} onChange={this.handleInputChange} />

                        <label>Manufacturer</label>
                        <Autocomplete
                            options={this.state.availableVaccineManufacturers}
                            debug
                            renderInput={(params) => <TextField {...params} variant="outlined" />}
                            onChange={(_, val) => this.setState({ vaccineManufacturer: val })}
                            getOptionLabel={(option) => option.name || ""}
                        />

                        <Button type="submit" className={'primary ' + (this.props.attemptingToSubmitVaccination ? 'disabled' : '')}>
                            {this.props.attemptingToSubmitVaccination ? 'Submitting...' : 'Submit'}
                        </Button>
                    </form>
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    sessionData: state.sessionData,
    attemptingToSubmitVaccination: state.attemptingToSubmitVaccination,
    modalOpen: ownProps.modalOpen,
    patient: ownProps.patient,
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(AddDoseModal);