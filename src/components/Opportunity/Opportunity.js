import React, { Component } from 'react';
import './Opportunity.css';
import NavBar from '../NavBar/NavBar';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Input, Label, Form, Button, Header, Icon, Image, Modal, Dropdown, Card, Dimmer, Loader } from 'semantic-ui-react'
import swal from 'sweetalert';
import axios from 'axios';
import { connect } from 'react-redux';
import { getHypotheses, getAllHypotheses, getWBSList } from '../../ducks/reducer';
import moment from 'moment';
import TasksByHyp from '../Tasks/TaskByHyp';

class Opportunity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedHyp: '',
            categories: [],
            packages: [],
            statusList: [],
            opportunityList: [],
            hypList: this.props.hypothesesList,
            //Handle Change
            selectedPackage: '',
            selectedCategory: '',
            selectedOpportunity: '',
            hypothesisVal: '',
            //Edit Row
            editCategory: '',
            editOpportunity: '',
            editHypothesisVal: '',
            editPackage: '',
            //Convert Modal
            convertRow: '',
            convertOpportunity: '',
            convertHypothesisVal: '',
            convertWBS: '',
            convertCR_Desc: '',
            //CreateTask
            taskOpportunity: '',
            task: '',
            taskLeads: '',
            taskStartDate: moment(),
            taskFinishDate: '',
            taskStatus: '',
            taskEstManHr: '',
            taskComment: '',
            //Edit Modal
            editModal: false,
            convertModal: false,
            createTaskModal: false,
            //Loading
            loading: true,
            //Approved Packages
            approvedPackages: []
        }
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

    reload = () => {
        this.props.selectedPackage === 0 ?
            this.props.getAllHypotheses().then(() => {
                this.setState({ loading: false })
            })
            :
            this.props.getHypotheses(this.props.selectedPackage).then(() => {
                this.setState({ loading: false })
            })
    }

    componentDidMount() {
        //Check if user approved for this package
        let approved = this.props.approvedPackages.filter(e => e.PackageID === this.props.selectedPackage);
        this.setState({
            approvedPackages: approved
        })
        //Populate Category Drop Down
        axios.get('/api/getCategories').then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ categories: [...this.state.categories, { key: e.CategoryID, value: e.CategoryID, text: e.Category }] })
            })
        })

        axios.get(`/api/getPackages/${this.props.userData.PersonID}`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ packages: [...this.state.packages, { key: e.PackageID, value: e.PackageID, text: e.PackageName }] })
            })
        })

        axios.get(`/api/getOpportunityWithNoCR/${this.props.userData.PersonID}`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ opportunityList: [...this.state.opportunityList, { key: e.HypothesesID, value: e.HypothesesID, text: e.Opportunity }] })
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
            hypList: nextProps.hypothesesList
        })
    }

    handleChange = (e, data, name) => {
        let newState = {}
        newState[name] = data.value
        this.setState(newState)
        console.log(data.value)
    }

    openEditModal = (row) => {
        this.setState({
            editedRow: row._original.HypothesesID,
            editPackage: row._original.PackageID,
            editCategory: row._original.CategoryID,
            editOpportunity: row._original.Opportunity,
            editHypothesisVal: row._original.Value,
            editModal: true
        })
    }

    openConvertModal = (row) => {
        this.setState({
            convertRow: row._original.HypothesesID,
            convertOpportunity: row._original.Opportunity,
            convertHypothesisVal: row._original.Value,
            convertModal: true
        })
    }

    deleteRow = (id) => {

        return swal({
            title: "Are you sure?",
            text: "Are you sure that you want to delete this Hypotheses?",
            icon: "warning",
            dangerMode: true,
        }).then(sure => {
            if (sure) {
                axios.delete(`/api/deleteHypotheses/${id}`).then(res => {
                    this.reload()
                    swal("Deleted!", "This row has been deleted!", "success");
                })
            }
        });
    }

    createHypotheses = () => {
        document.body.style.cursor = 'wait'
        const { selectedPackage, selectedCategory, selectedOpportunity, hypothesisVal } = this.state
        //Check all fields are completed
        if (selectedPackage === '' || selectedCategory === '' || selectedOpportunity === '' | hypothesisVal === '') {
            document.body.style.cursor = 'default'
            return swal({
                title: "Error",
                text: "Please complete all mandatory fields!",
                icon: "error"
            })
        }
        axios.post('/api/createHypotheses', { PackageID: selectedPackage, CategoryID: selectedCategory, Opportunity: selectedOpportunity, Value: Number(hypothesisVal), PersonID: this.props.userData.PersonID }).then(res => {
            this.reload()
            document.body.style.cursor = 'default'
            swal({
                title: "Success",
                text: "Hypotheses created!",
                icon: "success"
            })
            this.setState({ createModal: false })
        }).catch(err => {
            console.log('err', err)
        })
    }

    convertToCR = () => {
        const { convertRow, convertOpportunity, convertHypothesisVal, convertWBS, convertCR_Desc } = this.state
        //Check all fields are completed
        if (convertWBS === null || convertHypothesisVal === null || convertCR_Desc === null) {
            return swal({
                title: "Error",
                text: "Please complete all mandatory fields!",
                icon: "error"
            })
        }
        //1. Add to CR table first
        axios.post('/api/createCR', { WBSID: convertWBS, Opportunity: convertOpportunity, CR_Description: convertCR_Desc, CRs_Raised: Number(convertHypothesisVal), Date_Raised: moment() }).then(res => {
            //Once added and have the CRID, add to Hypotheses table
            axios.put(`/api/updateCRID/${convertRow}`, { CRID: res.data.recordset[0].CRID }).then(() => {
                this.setState({ convertModal: false })
                this.reload()
                swal({
                    title: "Success",
                    text: "Hypotheses converted to CR",
                    icon: "success"
                })
            }).catch(err => {
                console.log('err', err)
            })
        }).catch(err => {
            console.log('err', err)
        })
        this.setState({ convertModal: false })
    }

    removeCR = (id, HypID) => {
        return swal({
            title: "Are you sure?",
            text: "Are you sure that you want to delete this CR?",
            icon: "warning",
            dangerMode: true,
        }).then(sure => {
            if (sure) {
                axios.delete(`/api/deleteCR/${id}`).then(res => {
                    axios.put(`/api/removeCRID/${HypID}`).then(() => {
                        this.reload()
                        swal("Deleted!", "This CR has been deleted!", "success");
                    })
                })
            }
        });
    }

    editHypotheses = () => {
        const { editCategory, editOpportunity, editHypothesisVal, editPackage, editedRow } = this.state
        if (editCategory === '' || editOpportunity === '' || editHypothesisVal === '' | editPackage === '') {
            return alert('Please enter all fields!')
        }
        axios.put(`/api/editHypotheses/${editedRow}`, { PackageID: editPackage, CategoryID: editCategory, Opportunity: editOpportunity, Value: Number(editHypothesisVal) }).then(res => {
            this.setState({ editModal: false })
            this.reload()
            swal({
                title: "Success",
                text: "Hypotheses edited!",
                icon: "success"
            })
        }).catch(err => {
            console.log('err', err)
        })
    }

    createWP = () => {
        const { taskOpportunity, task, taskLeads, taskStartDate, taskFinishDate, taskStatus, taskEstManHr, taskComment } = this.state
        //Check all fields are completed
        if (taskOpportunity === '' || task === '' || taskLeads === '' || taskStartDate === '' || taskStatus === '' || taskEstManHr === '') {
            document.body.style.cursor = 'default'
            return alert('Please enter all fields!')
        }

        let Start = taskStartDate ? moment(taskStartDate).toISOString() : null
        let Finish = taskFinishDate ? moment(taskFinishDate).toISOString() : null

        axios.post('/api/createWPforHyp', { HypothesesID: taskOpportunity, Tasks: task, StatusID: taskStatus, Resource: taskLeads, Start: taskStartDate, Finish: taskFinishDate, Comments: taskComment, EstimatedHours: Number(taskEstManHr) }).then(res => {
            this.setState({ createTaskModal: false })
            this.reload()
            swal({
                title: "Success",
                text: "Added New Task!",
                icon: "success"
            })
        }).catch(err => {
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
                                    <div className="btn"><Button color="green" onClick={() => this.setState({ createModal: true })}>Create New Hypotheses</Button></div>
                                    <div className="btn"><Button color="green" onClick={() => this.setState({ createTaskModal: true })}>Create New Task</Button></div>
                                </div>
                            }
                            <Modal closeOnDimmerClick={true} onClose={() => this.setState({ createModal: false })} open={this.state.createModal}>
                                <Modal.Header>Create New Hypotheses</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label className="required">Package</label>
                                                <Dropdown onChange={(e, data) => this.handleChange(e, data, 'selectedPackage')} name="Package" placeholder='Package' search selection options={this.state.packages} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Category</label>
                                                <Dropdown onChange={(e, data) => this.handleChange(e, data, 'selectedCategory')} name="Category" placeholder='Category' search selection options={this.state.categories} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Opportunity</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'selectedOpportunity')} placeholder='Enter Opportunity...' />
                                            </Form.Field>
                                            <Input className="required" onChange={(e, data) => this.handleChange(e, data, 'hypothesisVal')} labelPosition='right' type='number' placeholder='Hypotheses Value'>
                                                <Label basic>$</Label>
                                                <input />
                                                <Label>.00</Label>
                                            </Input>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.createHypotheses()} color="green">
                                        Proceed <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        </div>

                        <div className="table">
                            <ReactTable
                                data={this.state.hypList}
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
                                        Header: "Hypotheses List",
                                        columns: [

                                            {
                                                Header: "Package",
                                                accessor: "PackageName"
                                            },
                                            {
                                                Header: "Category",
                                                accessor: "Category"
                                            },
                                            {
                                                Header: "Hypotheses",
                                                accessor: "Opportunity"
                                            },
                                            {
                                                Header: "Hypothesis Value",
                                                accessor: "Value",
                                                Cell: ({ value }) => value ? (Number(value.toFixed(1)).toLocaleString()) : null,
                                                getProps: (state, rowInfo, column) => {
                                                    return {
                                                        style: {
                                                            color: rowInfo ? rowInfo.row._original.CRID ? "green" : "darkOrange" : null
                                                        }
                                                    }
                                                }
                                            }, {
                                                Header: '',
                                                id: 'click-me-button',
                                                width: 250,
                                                show: this.state.approvedPackages.length > 0 ? true : false,
                                                Cell: ({ row }) => (
                                                    this.state.approvedPackages.length > 0 && (this.props.userData.ACM || this.props.userData.Lead) ?
                                                        <div className="actions">
                                                            <Button.Group size="mini">
                                                                <Button size='mini' onClick={() => this.openEditModal(row)}>Edit</Button>
                                                                <Button.Or />
                                                                <Button size='mini' onClick={() => this.deleteRow(row._original.HypothesesID)} negative>Delete</Button>
                                                            </Button.Group>

                                                            {!row._original.CRID ?
                                                                <div style={{ marginLeft: '3px' }}>
                                                                    <Button onClick={() => this.openConvertModal(row)} color="green" size='tiny' animated>
                                                                        <Button.Content visible>Convert CR</Button.Content>
                                                                        <Button.Content hidden>
                                                                            <Icon name='right arrow' />
                                                                        </Button.Content>
                                                                    </Button>
                                                                </div>
                                                                :
                                                                <div style={{ marginLeft: '3px' }}>
                                                                    <Button color="red" size='tiny' animated>
                                                                        <Button.Content onClick={() => this.removeCR(row._original.CRID, row._original.HypothesesID)} visible>Remove CR</Button.Content>
                                                                        <Button.Content hidden>
                                                                            <Icon name='left arrow' />
                                                                        </Button.Content>
                                                                    </Button>
                                                                </div>
                                                            }
                                                        </div>
                                                        :
                                                        <div className="actions"></div>
                                                ),
                                            }
                                        ]
                                    }
                                ]}
                                defaultPageSize={10}
                                onSortedChange={(c, s) => { document.activeElement.blur() }}
                                SubComponent={(row) => <TasksByHyp id={row.original.HypothesesID} />}
                                className="-striped -highlight"
                            // getTrProps={(state, rowInfo, column) => {
                            //     return {
                            //       style: {
                            //         textDecoration: rowInfo ? rowInfo.original.CRID ? 'line-through' : 'none' : 'none',
                            //       }
                            //     }

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
                                                <Dropdown onChange={(e, data) => this.handleChange(e, data, 'taskOpportunity')} name="Opportunity" placeholder='Opportunity' search selection options={this.state.opportunityList} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Task</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'task')} placeholder='Task...' />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">List Leads</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'taskLeads')}  placeholder='Leads...' />
                                            </Form.Field>
                                            <Form.Group widths='equal'>
                                                <Form.Field>
                                                    <label className="required">Start Date</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'taskStartDate')} type="date" />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label className="required">Finish Date</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'taskFinishDate')} type="date" />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label className="required">Status</label>
                                                    <Form.Select onChange={(e, data) => this.handleChange(e, data, 'taskStatus')} fluid options={this.state.statusList} placeholder='Status' />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label className="required">Estimated Man Hours</label>
                                                    <Form.Input onChange={(e, data) => this.handleChange(e, data, 'taskEstManHr')} type="number" />
                                                </Form.Field>
                                            </Form.Group>
                                            <Form.Field>
                                                <label className="required">Comments</label>
                                                <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'taskComment')} placeholder='Comments...' />
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
                                <Modal.Header>Edit Hypotheses</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label className="required">Package</label>
                                                <Dropdown value={this.state.editPackage} onChange={(e, data) => this.handleChange(e, data, 'editPackage')} name="editPackage" placeholder='Package' search selection options={this.state.packages} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Category</label>
                                                <Dropdown value={this.state.editCategory} onChange={(e, data) => this.handleChange(e, data, 'editCategory')} name="Category" placeholder='Category' search selection options={this.state.categories} />
                                            </Form.Field>
                                            <Form.TextArea className="required" value={this.state.editOpportunity} onChange={(e, data) => this.handleChange(e, data, 'editOpportunity')} label='Opportunity' placeholder='Enter Opportunity...' />
                                            <Input className="required" value={this.state.editHypothesisVal} onChange={(e, data) => this.handleChange(e, data, 'editHypothesisVal')} labelPosition='right' type='number' placeholder='Hypotheses Value'>
                                                <Label basic>$</Label>
                                                <input />
                                                <Label>.00</Label>
                                            </Input>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.editHypotheses()} color="green">
                                        Proceed <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>

                            <Modal closeOnDimmerClick={true} onClose={() => this.setState({ convertModal: false })} open={this.state.convertModal}>
                                <Modal.Header>Convert To CR</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Group inline>
                                            </Form.Group>
                                            <Form.Field>
                                                <label>Opportunity</label>
                                                <p>{this.state.convertOpportunity}</p>
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">WBS</label>
                                                <Dropdown name="WBS" onChange={(e, data) => this.handleChange(e, data, 'convertWBS')} placeholder='WBS' search selection options={this.props.WBSList} />
                                            </Form.Field>
                                            <Form.TextArea onChange={(e, data) => this.handleChange(e, data, 'convertCR_Desc')} label='CR Description' placeholder='CR Description...' />
                                            <Input className="required" value={this.state.convertHypothesisVal.toLocaleString()} onChange={(e, data) => this.handleChange(e, data, 'convertHypothesisVal')} labelPosition='right' type='text' placeholder='CRs Raised'>
                                                <Label basic>$</Label>
                                                <input />
                                                <Label>.00</Label>
                                            </Input>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={() => this.convertToCR()} color="green">
                                        Proceed to convert to CR <Icon name='right chevron' />
                                    </Button>
                                </Modal.Actions>
                            </Modal>

                        </div>
                    </div>
                    :

                    <Loader active content='Loading' />

                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        hypothesesList: state.hypothesesList,
        approvedPackages: state.ApprovedPackages,
        WBSList: state.WBSList,
        userData: state.userData
    };
}

export default connect(mapStateToProps, { getHypotheses, getAllHypotheses, getWBSList })(Opportunity)



