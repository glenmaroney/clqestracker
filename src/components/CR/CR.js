import React, { Component } from 'react';
import './CR.css';
import NavBar from '../NavBar/NavBar';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Input, Label, Form, Button, Header, Icon, Image, Modal, Dropdown, Card, Dimmer, Loader } from 'semantic-ui-react'
import Tasks from '../Tasks/Tasks';
import swal from 'sweetalert';
import { connect } from 'react-redux';
import { getAllCRs, getCRs, getWBSList } from '../../ducks/reducer';
import axios from 'axios';
import moment from 'moment';

class CR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //Drop Downs
            opportunityList: [],
            //WBSList: [],
            //Table Data
            CRList: this.props.CRList,
            //Handle Change
            selectedOpportunity: '',
            selectedWBS: '',
            CRDescription: '',
            CRFigure: '',
            //Edit
            editRow: '',
            editWBS: '',
            editCRDescription: '',
            editCRFigure: '',
            //Loading
            loading: true,
            //Next CR
            nextCR: 1,
            approvedPackages: [],
            //Creating Task for a CR
            createTaskModal: false,
            selectedTask: '',
            selectedLeads: '',
            startDate: '',
            finishDate: '',
            selectedStatus: '',
            selectedEstManHr: '',
            selectedComment: '',
            opportunityListTask: [],
            statusList: []
        }
    }

    reload = () => {
        this.props.selectedPackage === 0 ?
            this.props.getAllCRs().then(() => {
                this.setState({ loading: false })
            })
            :
            this.props.getCRs(this.props.selectedPackage).then(() => {
                this.setState({ loading: false })
            })
    }

    componentWillMount() {
        axios.get('/auth/me').then(res => {
            if (!res.data) {
                return this.props.history.push('/401')
            }
        }).catch(err => {
            console.log(err)
            return this.props.history.push('/401')
        })
    }

    componentDidMount() {
        //Check if user approved for this package
        let approved = this.props.approvedPackages.filter(e => e.PackageID === this.props.selectedPackage);
        this.setState({
            approvedPackages: approved
        })

        axios.get(`/api/getOpportunityWithNoCR/${this.props.userData.PersonID}`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ opportunityList: [...this.state.opportunityList, { key: e.HypothesesID, value: e.HypothesesID, text: e.Opportunity }] })
            })
        })

        axios.get(`/api/getOpportunityWithCR/${this.props.userData.PersonID}`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ opportunityListTask: [...this.state.opportunityListTask, { key: e.CRID, value: e.CRID, text: e.Opportunity }] })
            })
        })
        axios.get('/api/getStatus').then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ statusList: [...this.state.statusList, { key: e.StatusID, value: e.StatusID, text: e.Status }] })
            })
        })

        this.props.getWBSList()
        this.reload()
    }

    componentWillReceiveProps(nextProps) {
        let approved = nextProps.approvedPackages.filter(e => e.PackageID === nextProps.selectedPackage);
        this.setState({
            approvedPackages: approved,
            CRList: nextProps.CRList
        })
    }

    handleChange = (e, data, name) => {
        let newState = {}
        newState[name] = data.value
        this.setState(newState)
    }

    openEditModal = (row) => {
        this.setState({
            editOpportunity: row._original.Opportunity,
            editRow: row._original.CRID,
            editWBS: row._original.WBSID,
            editCRDescription: row._original.CR_Description,
            editCRFigure: row._original.CRs_Raised,
            editModal: true
        })
    }

    editCR = () => {
        document.body.style.cursor = 'wait'
        const { editWBS, editCRDescription, editCRFigure, editRow } = this.state
        if (editWBS === null || editCRDescription === null || editCRFigure === null) {
            document.body.style.cursor = 'default'
            return swal({
                title: "Error",
                text: "Please enter all fields",
                icon: "warning"
            })
        }
        axios.put(`/api/editCR/${editRow}`, { WBSID: editWBS, CR_Description: editCRDescription, CRs_Raised: Number(editCRFigure) }).then(res => {
            this.reload()
            swal({
                title: "Success",
                text: "Updated!",
                icon: "success"
            })
            this.setState({ editModal: false })
            document.body.style.cursor = 'default'
        }).catch(err => {
            document.body.style.cursor = 'default'
            console.log('err', err)
        })
    }

    deleteRow = (id, HypID) => {
        return swal({
            title: "Are you sure?",
            text: "Are you sure that you want to delete this CR?",
            icon: "warning",
            dangerMode: true,
        }).then(sure => {
            if (sure) {
                axios.delete(`/api/deleteCR/${id}`).then(res => {
                    axios.put(`/api/removeCRID/${HypID}`).then(() => {
                        swal("Deleted!", "This CR has been deleted!", "success");
                        this.reload()
                    })
                })
            }
        });
    }

    createCR = () => {
        document.body.style.cursor = 'wait'
        const { selectedWBS, selectedOpportunity, CRDescription, CRFigure } = this.state
        //Check all fields are completed
        if (selectedWBS === '' || selectedOpportunity === '' || CRDescription === '' || CRFigure === '') {
            document.body.style.cursor = 'default'
            return alert('Please enter all fields!')
        }
        //1. Get Max CR
        axios.get('/api/MaxCR').then(res => {
            let newState = {}
            newState['nextCR'] = Number(res.data.recordset[0].Max) + 1
            this.setState(newState)

            //2. Add to CR table first
            axios.post('/api/createCR', { WBSID: selectedWBS, Opportunity: selectedOpportunity, CR_Description: CRDescription, CRs_Raised: Number(CRFigure), Date_Raised: moment(), CR_Reference: this.state.nextCR }).then(res => {
                //Once added and have the CRID, add to Hypotheses table
                axios.put(`/api/updateCRID/${selectedOpportunity}`, { CRID: res.data.recordset[0].CRID }).then(() => {
                    document.body.style.cursor = 'default'
                    swal({
                        title: "Success",
                        text: "CR created!",
                        icon: "success"
                    })
                    this.setState({ createModal: false })
                }).catch(err => {
                    document.body.style.cursor = 'default'
                    console.log('err', err)
                })
            }).catch(err => {
                document.body.style.cursor = 'default'
                console.log('err', err)
            })
        })
        this.setState({ createModal: false })
        this.reload()
    }

    actualize = (row) => {
        let CRID = row._original.CRID
        axios.put(`/api/actualize/${CRID}`).then((res) => {
            this.reload()
            swal({
                title: "Success",
                text: "CR has been included in the DFS",
                icon: "success"
            })
        }).catch(err => {
            console.log(err)
            swal({
                title: "Error",
                text: "Error, please contact supprt",
                icon: "Error"
            })
        })
    }

    unactualize = (row) => {
        let CRID = row._original.CRID
        axios.put(`/api/unactualize/${CRID}`).then((res) => {
            this.reload()
            swal({
                title: "Success",
                text: "CR has been excluded in the DFS",
                icon: "success"
            })
        }).catch(err => {
            console.log(err)
            swal({
                title: "Error",
                text: "Error, please contact supprt",
                icon: "Error"
            })
        })
    }

    createWP = () => {
        document.body.style.cursor = 'wait'
        const { selectedTask, selectedOpportunity, selectedLeads, selectedStatus, selectedEstManHr, startDate, finishDate, selectedComment } = this.state
        //Check all fields are completed
        if (selectedTask === '' || selectedOpportunity === '' || selectedLeads === '' || selectedStatus === '' || startDate === '' || selectedEstManHr === '') {
            document.body.style.cursor = 'default'
            return swal({
                title: "Error",
                text: "Please complete all mandatory fields!",
                icon: "error"
            })
        }

        let Start = startDate ? startDate : null
        let Finish = finishDate ? finishDate : null

        axios.post('/api/createWP', { CRID: selectedOpportunity, Tasks: selectedTask, StatusID: selectedStatus, Resource: selectedLeads, Start: Start, Finish: Finish, Comments: selectedComment, EstimatedHours: Number(selectedEstManHr) }).then(res => {
            this.setState({ createTaskModal: false })
            this.reload()
            document.body.style.cursor = 'default'
            swal({
                title: "Success",
                text: "Added New Task!",
                icon: "success"
            })
        }).catch(err => {
            document.body.style.cursor = 'default'
            console.log('err', err)
        })
    }

    render() {
        return (
            <div>
                <NavBar />
                {!this.state.loading ?
                    <div className="Main">
                        <div className="modal">
                            {this.state.approvedPackages.length > 0 && (this.props.userData.ACM || this.props.userData.Lead) &&
                                <div className="buttonHeader">
                                    <div className="btn"><Button color="green" onClick={() => this.setState({ createModal: true })}>Create CR</Button></div>
                                    <div className="btn"><Button color="green" onClick={() => this.setState({ createTaskModal: true })}>Create New Task</Button></div>
                                </div>
                            }
                        </div>
                        <div className="table">
                            <ReactTable
                                data={this.state.CRList}
                                filterable
                                columns={[

                                    {
                                        Header: "",
                                        columns: [
                                            {
                                                expander: true,
                                                Header: () => <strong>Expand</strong>,
                                                width: 65,
                                                Expander: ({ isExpanded, ...rest }) =>
                                                    <div>
                                                        {isExpanded
                                                            ? <span>&#x2299;</span>
                                                            : <span>&#x2295;</span>}
                                                    </div>,
                                                style: {
                                                    cursor: "pointer",
                                                    fontSize: 20,
                                                    padding: "5",
                                                    textAlign: "center",
                                                    userSelect: "none"
                                                }
                                            }
                                        ]
                                    },

                                    {
                                        Header: "Capex Reduction List",
                                        columns: [
                                            {
                                                Header: "Package",
                                                accessor: "PackageName"
                                            },
                                            {
                                                Header: "Hypotheses",
                                                accessor: "Opportunity"
                                            },
                                            {
                                                Header: "CRs Raised",
                                                accessor: "CRs_Raised",
                                                Cell: ({ value }) => value ? (Number(value.toFixed(1)).toLocaleString()) : null
                                            },
                                            {
                                                Header: "WBS(L4)",
                                                accessor: "L4"
                                            },
                                            {
                                                Header: "CR Description",
                                                accessor: "CR_Description"
                                            },
                                            {
                                                Header: "Date Raised",
                                                accessor: "Date_Raised",
                                                Cell: ({ row }) => row._original.Date_Raised && (`${moment(row._original.Date_Raised).format("YYYY-MM-DD")}`)
                                            }
                                            ,
                                            {
                                                Header: "Sent to DFS",
                                                accessor: "Actualized",
                                                Cell: ({ value }) => (value ? "Yes" : "No"),
                                                filterMethod: (filter, row) => {
                                                    if (filter.value === "all") {
                                                        return true;
                                                    }
                                                    if (filter.value === "true") {
                                                        return row[filter.id] === true;
                                                    }
                                                    return row[filter.id] !== true;
                                                },
                                                Filter: ({ filter, onChange }) =>
                                                    <select
                                                        onChange={event => onChange(event.target.value)}
                                                        style={{ width: "100%" }}
                                                        value={filter ? filter.value : "all"}
                                                    >
                                                        <option value="all">Show All</option>
                                                        <option value="true">Sent to DFS</option>
                                                        <option value="false">On Hold</option>
                                                    </select>
                                            },
                                            {
                                                Header: "CR Reference",
                                                accessor: "CR_Reference"
                                            }

                                            , {
                                                Header: 'Send To DFS',
                                                id: 'click-me-button',

                                                show: this.state.approvedPackages.length > 0 && this.props.userData.ACM ? true : false,
                                                Cell: ({ row }) => (
                                                    !row._original.Actualized ?
                                                        <div style={{ marginLeft: '3px' }}>
                                                            <Button onClick={() => this.actualize(row)} color="green" size='tiny' positive animated>
                                                                <Button.Content visible>Yes</Button.Content>
                                                                <Button.Content hidden>
                                                                    <Icon name='plus' />
                                                                </Button.Content>
                                                            </Button>
                                                        </div>
                                                        :
                                                        <div style={{ marginLeft: '3px' }}>
                                                            <Button onClick={() => this.unactualize(row)} color="red" size='tiny' animated>
                                                                <Button.Content visible>No</Button.Content>
                                                                <Button.Content hidden>
                                                                    <Icon name='remove' />
                                                                </Button.Content>
                                                            </Button>
                                                        </div>
                                                )
                                            }
                                            , {
                                                Header: '',
                                                id: 'click-me-button',
                                                width: 200,
                                                show: this.state.approvedPackages.length > 0 ? true : false,
                                                Cell: ({ row }) => (
                                                    this.state.approvedPackages.length > 0 && (this.props.userData.ACM || this.props.userData.Lead) ?
                                                        <div className="actions">
                                                            <Button.Group size="mini">
                                                                <Button onClick={() => this.openEditModal(row)}>Edit</Button>
                                                                <Button.Or />
                                                                <Button onClick={() => this.deleteRow(row._original.CRID, row._original.HypothesesID)} negative>Remove</Button>
                                                            </Button.Group>
                                                        </div>
                                                        :
                                                        <div className="actions"></div>
                                                ),
                                            }
                                        ]
                                    }
                                ]
                                }
                                defaultPageSize={10}
                                onSortedChange={(c, s) => { document.activeElement.blur() }}
                                SubComponent={(row) => row.original.CRID ? <Tasks id={row.original.CRID} /> : <div>No Tasks</div>}
                                className="-striped -highlight"
                            />

                            <Modal closeOnDimmerClick={true} onClose={() => this.setState({ createTaskModal: false })} open={this.state.createTaskModal}>
                                <Modal.Header>Add Tasks</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label className="required">Opportunity</label>
                                                <Dropdown onChange={(e, data) => this.handleChange(e, data, 'selectedOpportunity')} name="Opportunity" placeholder='Opportunity' search selection options={this.state.opportunityListTask} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Task</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'selectedTask')} placeholder='Task...' />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">List Leads</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'selectedLeads')} placeholder='Leads...' />
                                                {/* <Dropdown onChange={(e, data) => this.handleChange(e, data, 'selectedLeads')} name="Leads" placeholder='Leads' fluid multiple search selection options={this.state.leadList} /> */}
                                            </Form.Field>
                                            <Form.Group>
                                                {/* <Form.Select onChange={(e, data) => this.handleChange(e, data, 'selectedApproach')} fluid label='Approach' options={this.state.approachList} placeholder='Approach' /> */}
                                            </Form.Group>
                                            <Form.Group widths='equal'>
                                                <Form.Field>
                                                    <label className="required">Start Date</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'startDate')} value={this.state.startDate} type="date" />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label >Finish Date</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'finishDate')} value={this.state.finishDate} type="date" />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label className="required">Status</label>
                                                    <Form.Select onChange={(e, data) => this.handleChange(e, data, 'selectedStatus')} fluid options={this.state.statusList} placeholder='Status' />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label className="required">Estimated Man Hours</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'selectedEstManHr')} type="number" />
                                                </Form.Field>
                                            </Form.Group>
                                            <Form.Field>
                                                <label >Comments</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'selectedComment')} placeholder='Comments...' />
                                            </Form.Field>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.createWP()} color="green">
                                        Proceed <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>

                            <Modal closeOnDimmerClick={true} onClose={() => this.setState({ editModal: false })} open={this.state.editModal}>
                                <Modal.Header>Edit CR</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label>Opportunity</label>
                                                <p>{this.state.editOpportunity}</p>
                                                {/* <Dropdown value={this.state.editOpportunity} name="Opportunity" onChange={(e, data) => this.handleChange(e, data, 'editOpportunity')} placeholder='Opportunity' search selection options={this.state.opportunityList} /> */}
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">WBS</label>
                                                <Dropdown value={this.state.editWBS} name="WBS" onChange={(e, data) => this.handleChange(e, data, 'editWBS')} placeholder='WBS' search selection options={this.props.WBSList} />
                                            </Form.Field>
                                            <label className="required">CR Description</label>
                                            <Form.TextArea value={this.state.editCRDescription} onChange={(e, data) => this.handleChange(e, data, 'editCRDescription')} placeholder='CR Description...' />
                                            <Input className="required" value={this.state.editCRFigure} onChange={(e, data) => this.handleChange(e, data, 'editCRFigure')} labelPosition='right' type='text' placeholder='CRs Raised'>
                                                <Label basic>$</Label>
                                                <input />
                                                <Label>.00</Label>
                                            </Input>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.editCR()} color="green">
                                        Save <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>

                            <Modal closeOnDimmerClick={true} onClose={() => this.setState({ createModal: false })} open={this.state.createModal}>
                                <Modal.Header>Create New CR</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label className="required">Opportunity</label>
                                                <Dropdown name="Opportunity" onChange={(e, data) => this.handleChange(e, data, 'selectedOpportunity')} placeholder='Opportunity' search selection options={this.state.opportunityList} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">WBS</label>
                                                <Dropdown name="WBS" onChange={(e, data) => this.handleChange(e, data, 'selectedWBS')} placeholder='WBS' search selection options={this.props.WBSList} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">CR Description</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'CRDescription')} placeholder='CR Description...' />
                                            </Form.Field>
                                            <Input className="required" onChange={(e, data) => this.handleChange(e, data, 'CRFigure')} labelPosition='right' type='text' placeholder='CRs Raised'>
                                                <Label basic>$</Label>
                                                <input />
                                                <Label>.00</Label>
                                            </Input>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.createCR()} color="green">
                                        Add <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>

                        </div>
                    </div>
                    :
                    <Loader active content='Loading' />
                }
            </div >
        );
    }
}

function mapStateToProps(state) {
    console.log(state.CRList)
    return {
        selectedPackage: state.selectedPackage,
        approvedPackages: state.ApprovedPackages,
        CRList: state.CRList,
        userData: state.userData,
        WBSList: state.WBSList
    };
}

export default connect(mapStateToProps, { getAllCRs, getCRs, getWBSList })(CR)





