import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../css/Main.scss';
import loading from '../img/loading.gif';
import { DataGrid } from '@mui/x-data-grid';
import { Button, ButtonGroup, Dialog, DialogContent, Modal } from '@material-ui/core';
import AddPatientModal from './AddPatientModal';
import AddDoseModal from './AddDoseModal';

class Main extends Component {

    constructor(props) {
        super(props);
        this.columns = [
            {
                field: 'name',
                headerName: 'Name',
                type: 'string',
                flex: 1,
                minWidth: 100,
            },
            {
                field: 'healthcareProvider',
                headerName: 'Healthcare Provider',
                type: 'string',
                minWidth: 100,
                flex: 1,
                valueFormatter: (params) => params?.row?.healthcareProvider?.name,
            },
            {
                field: 'vaccineManufacturer',
                headerName: 'Vaccine Manufacturer',
                type: 'string',
                minWidth: 100,
                flex: 1,
                valueFormatter: (params) => [...new Set(params?.row?.vaccinations?.map(v => v.vaccineManufacturer?.name).filter(v => v) || [])].join(', '),
            },
            {
                field: 'requiredDoses',
                headerName: 'Required Doses',
                type: 'string',
                minWidth: 100,
                flex: 1,
                // required doses is calculated as the max of the requiredDoses for each vaccine manufacturer
                valueFormatter: (params) => params?.row?.vaccinations?.length ?
                    Math.min(...params.row.vaccinations.map(v => {
                        const requiredDoses = v?.vaccineManufacturer?.requiredDoses;
                        
                        return Number.isInteger(requiredDoses) && requiredDoses >= 1 ? requiredDoses : Infinity;
                    })) : 'N/A',
            },
            {
                field: 'vaccineDoses',
                headerName: 'Vaccine Doses Taken',
                type: 'string',
                minWidth: 100,
                flex: 1,
                valueFormatter: (params) => params?.row?.vaccinations?.length || 0,
            },
            {
                field: 'fullyVaccinated',
                headerName: 'Fully Vaccinated',
                type: 'boolean',
                minWidth: 100,
                flex: 1,
            },
            {
                field: 'contractAddress',
                headerName: 'Contract Address',
                type: 'string',
                minWidth: 100,
                flex: 1,
            },
            {
                field: '',
                headerName: 'Add Vaccination',
                flex: 1,
                renderCell: (params) => {
                    const onClick = () => this.openAddDoseModal(params);

                    return <Button onClick={onClick}>VACCINATE</Button>;
                }
            }
        ];

        this.state = {
            options: {
                filter: {
                    'healthcareProviderId': this.props.sessionData.user.healthCareProvider._id || '',
                },
                page: this.props.sessionData.patients?.pagination?.page || 1,
                pageSize: this.props.sessionData.patients?.pagination?.pageSize || 10,
                sort: null
            },
            rows: this.props.sessionData?.patients?.items || [],
            pagination: this.props.sessionData?.patients?.pagination || {},
            patientModalOpen: this.props.patientModalOpen || false,
            doseModalOpen: this.props.doseModalOpen || false,
            selectedPatientRow: this.props.selectedPatientRow || {},
        }

        this.getPatients = this.getPatients.bind(this);
        this.openAddPatientModal = this.openAddPatientModal.bind(this);
        this.closeAddPatientModal = this.closeAddPatientModal.bind(this);
        this.openAddDoseModal = this.openAddDoseModal.bind(this);
        this.closeAddDoseModal = this.closeAddDoseModal.bind(this);
        this.getPatients();
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        this.setState(prevState => ({
            ...prevState,
            rows: nextProps.sessionData.patients?.items,
            pagination: nextProps.sessionData.patients?.pagination,
            options: {
                ...prevState.options,
                filter: {
                    healthcareProviderId: nextProps.sessionData.user.healthCareProvider._id || '',
                },
                page: nextProps.sessionData.patients?.pagination?.page || 1,
                pageSize: nextProps.sessionData.patients?.pagination?.pageSize || 10,
            }
        }));
    }

    getPatients(page) {
        this.props.dispatch({
            type: "GET_PATIENTS",
            payload: {
                filter: {
                    'healthcareProviderId': this.props.sessionData.user.healthCareProvider._id || '',
                },
                page: page + 1 ?? this.state.page,
                pageSize: this.state.page,
                sort: null
            }
        })
    }

    openAddPatientModal() {
        this.setState({ patientModalOpen: true });
    }

    closeAddPatientModal() {
        this.setState({ patientModalOpen: false });
    }

    openAddDoseModal(row) {
        this.setState({
            doseModalOpen: true,
            selectedPatientRow: row,
        });
    }

    closeAddDoseModal() {
        this.setState({ doseModalOpen: false });
    }

    render() {
        console.log(this.props)
        return (
            <div className="main-screen-contents">
                <AddPatientModal modalOpen={this.state.patientModalOpen} onClose={this.closeAddPatientModal}/>
                <AddDoseModal modalOpen={this.state.doseModalOpen} patient={this.state.selectedPatientRow?.row} onClose={this.closeAddDoseModal}/>
                <div className="center">
                    <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
                        <Button name="refresh" onClick={this.getPatients}>Refresh</Button>
                        <Button name="addPatient" onClick={this.openAddPatientModal}>Add Patient</Button>
                    </ButtonGroup>
                </div>

                <DataGrid
                    paginationMode="server"
                    pagination
                    rowCount={this.state.pagination?.total}
                    rows={this.state.rows || []}
                    columns={this.columns}
                    pageSize={this.state.options.pageSize}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    onPageChange={(page) => this.getPatients(page) }
                />
            </div>
        );

    }
}

const mapStateToProps = (state) => ({
    sessionData: state.sessionData,
    contractState: state.contractState,
    lastEvent: state.lastEvent,
    patientModalOpen: state.patientModalOpen,
    doseModalOpen: state.doseModalOpen,
});

export default connect(mapStateToProps)(Main);