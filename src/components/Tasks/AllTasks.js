import React, { Component } from 'react';
import './AllTasks.css';
import NavBar from '../NavBar/NavBar';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Table, Input, Label, Form, Button, Header, Icon, Image, Modal, Dropdown, Card, Dimmer, Loader } from 'semantic-ui-react'
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import swal from 'sweetalert';
import { connect } from 'react-redux';
import { getWPs, getAllWPs } from '../../ducks/reducer';
import axios from 'axios';

class AllTasks extends Component {
    constructor(props) {
        super(props)
        this.state = {
            opportunityList: [],
            statusList: [],
            taskData: this.props.WPList,
            //Handle Change
            selectedTask: '',
            selectedOpportunity: '',
            selectedLeads: [],
            selectedStatus: '',
            selectedEstManHr: '',
            startDate: moment(),
            finishDate: '',
            selectedComment: '',
            createModal: false,
            //Edit
            editRow: '',
            editTask: '',
            editLeads: '',
            editStatus: '',
            editStartDate: null,
            editFinishDate: null,
            editManHours: '',
            editComments: '',
            editModal: false,
            //loading
            loading: true,
            approvedPackages: []
        }
    }

    reload = () => {
        this.props.selectedPackage === 0 ?
            this.props.getAllWPs().then(() => {
                this.setState({ loading: false })
            })
            :
            this.props.getWPs(this.props.selectedPackage).then(() => {
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

    componentWillReceiveProps(nextProps) {
        let approved = nextProps.approvedPackages.filter(e => e.PackageID === nextProps.selectedPackage);
        this.setState({
            approvedPackages: approved,
            taskData: nextProps.WPList
        })
    }


    componentDidMount() {
        //Check if user approved for this package
        let approved = this.props.approvedPackages.filter(e => e.PackageID === this.props.selectedPackage);
        this.setState({
            approvedPackages: approved
        })

        axios.get(`/api/getOpportunityWithCR/${this.props.userData.PersonID}`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ opportunityList: [...this.state.opportunityList, { key: e.CRID, value: e.CRID, text: e.Opportunity }] })
            })
        })
        axios.get('/api/getStatus').then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ statusList: [...this.state.statusList, { key: e.StatusID, value: e.StatusID, text: e.Status }] })
            })
        })
        this.reload()
    }

    handleChange = (e, data, name) => {
        let val = data.value;
        if (!data.value) {
            val = null
        }
        let newState = {}
        newState[name] = val
        this.setState(newState)
    }

    openEditModal = (row) => {
        this.setState({
            editRow: row._original.WorkID,
            editTask: row._original.Tasks,
            editLeads: row._original.Resource,
            editStatus: row._original.StatusID,
            editStartDate: row._original.Start ? moment(row._original.Start).format('YYYY-MM-DD') : null,
            editFinishDate: row._original.Finish ? moment(row._original.Finish).format('YYYY-MM-DD') : null,
            editComments: row._original.Comments,
            editManHours: row._original.EstimatedHours,
            editModal: true
        })
    }

    deleteRow = (id) => {
        return swal({
            title: "Are you sure?",
            text: "Are you sure that you want to delete this Task?",
            icon: "warning",
            dangerMode: true,
        }).then(sure => {
            if (sure) {
                axios.delete(`/api/deleteWP/${id}`).then(res => {
                    this.reload()
                    document.body.style.cursor = 'default'
                    swal("Deleted!", "This row has been deleted!", "success");
                })
            }
        })
    }

    // createWP = () => {
    //     document.body.style.cursor = 'wait'
    //     const { selectedTask, selectedOpportunity, selectedLeads, selectedStatus, selectedEstManHr, startDate, finishDate, selectedComment } = this.state
    //     //Check all fields are completed
    //     if (selectedTask === '' || selectedOpportunity === '' || selectedLeads === '' || selectedStatus === '' || startDate === '' || selectedEstManHr === '') {
    //         document.body.style.cursor = 'default'
    //         return swal({
    //             title: "Error",
    //             text: "Please complete all mandatory fields!",
    //             icon: "error"
    //         })
    //     }

    //     let Start = startDate ? startDate : null
    //     let Finish = finishDate ? finishDate : null

    //     axios.post('/api/createWP', { CRID: selectedOpportunity, Tasks: selectedTask, StatusID: selectedStatus, Resource: selectedLeads, Start: Start, Finish: Finish, Comments: selectedComment, EstimatedHours: Number(selectedEstManHr) }).then(res => {
    //         this.setState({ createModal: false })
    //         this.reload()
    //         document.body.style.cursor = 'default'
    //         swal({
    //             title: "Success",
    //             text: "Added New Task!",
    //             icon: "success"
    //         })
    //     }).catch(err => {
    //         document.body.style.cursor = 'default'
    //         console.log('err', err)
    //     })
    // }

    editWP = () => {
        document.body.style.cursor = 'wait'
        const { editRow, editTask, editLeads, editStatus, editStartDate, editFinishDate, editComments, editManHours } = this.state
        let Start = editStartDate ? editStartDate : null
        let Finish = editFinishDate ? editFinishDate : null
        console.log(editTask)
        if (editTask === null || editStartDate === null || editLeads === null || editStatus === null || editManHours === null) {
            document.body.style.cursor = 'default'
            return swal({
                title: "Error",
                text: "Please complete all mandatory fields!",
                icon: "error"
            })
        }
        axios.put(`/api/editWP/${editRow}`, { Tasks: editTask, Resource: editLeads, StatusID: editStatus, StartDate: Start, FinishDate: Finish, Comments: editComments, EstimatedHours: Number(editManHours) }).then(res => {
            this.setState({ editModal: false })
            swal({
                title: "Success",
                text: "Update Complete",
                icon: "success"
            })
            this.reload()
            document.body.style.cursor = 'default'
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
                           <ReactTable
                            data={this.state.taskData}
                            filterable
                            columns={[
                                {
                                    Header: "All Work Planning Tasks",
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
                                            Header: "Tasks",
                                            accessor: "Tasks"
                                        },
                                        {
                                            Header: "Resource",
                                            accessor: "Resource"
                                        },
                                        {
                                            Header: "Status",
                                            accessor: "Status",
                                            getProps: (state, rowInfo, column) => {
                                                return {
                                                    style: {
                                                        color: rowInfo ? rowInfo.row._original.Status === "Complete" && "#2eb82e" : null
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            Header: "Start",
                                            accessor: "Start",
                                            Cell: ({ row }) => row._original.Start && (`${moment(row._original.Start).format("YYYY-MM-DD")}`)
                                        },
                                        {
                                            Header: "Finish",
                                            accessor: "Finish",
                                            Cell: ({ row }) => row._original.Finish && (`${moment(row._original.Finish).format("YYYY-MM-DD")}`)
                                        }, {
                                            Header: "Est Man Hr",
                                            accessor: "EstimatedHours"
                                        },
                                        {
                                            Header: "Comments",
                                            accessor: "Comments"
                                        },

                                        {
                                            Header: "Task Attached To",
                                            accessor: "AttachedTo",
                                            filterMethod: (filter, row) => {
                                                if (filter.value === "all") {
                                                    return true;
                                                }
                                                if (filter.value === "cr") {
                                                    return row[filter.id] === 'CR';
                                                }
                                                return row[filter.id] !== 'CR';
                                            },
                                            Filter: ({ filter, onChange }) =>
                                                <select
                                                    onChange={event => onChange(event.target.value)}
                                                    style={{ width: "100%" }}
                                                    value={filter ? filter.value : "all"}
                                                >
                                                    <option value="all">Show All</option>
                                                    <option value="cr">CR</option>
                                                    <option value="false">Hypotheses</option>
                                                </select>
                                        },
                                        // ,
                                        // {
                                        //     Header: "Rank",
                                        //     accessor: "Rank"
                                        // },
                                        {
                                            Header: '',
                                            id: 'click-me-button',
                                            width: 200,
                                            show: this.state.approvedPackages.length > 0 ? true : false,
                                            Cell: ({ row }) => (
                                                this.state.approvedPackages.length > 0 && (this.props.userData.ACM || this.props.userData.Lead) ?
                                                    <div className="actions">
                                                        <Button.Group size='mini'>
                                                            <Button onClick={() => this.openEditModal(row)} positive>Edit</Button>
                                                            <Button.Or />
                                                            <Button onClick={() => this.deleteRow(row._original.WorkID)} negative>Remove</Button>
                                                        </Button.Group>
                                                    </div>
                                                    :
                                                    <div className="actions">

                                                    </div>
                                            ),
                                        }
                                    ]
                                }
                            ]}
                            defaultPageSize={10}
                            className="-highlight -striped"
                            onSortedChange={(c, s) => { document.activeElement.blur() }}
                        />


                        <Modal closeOnDimmerClick={true} onClose={() => this.setState({ editModal: false })} open={this.state.editModal}>
                            <Modal.Header>Edit Task</Modal.Header>
                            <Modal.Content image scrolling>
                                <Modal.Description>
                                    <Form>
                                        <Form.Group inline>
                                        </Form.Group>
                                        <Form.Field>
                                            <label className="required">Task</label>
                                            <Form.TextArea value={this.state.editTask} onChange={(e, data) => this.handleChange(e, data, 'editTask')} placeholder='Task...' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label className="required">Leads</label>
                                            <Form.TextArea value={this.state.editLeads} onChange={(e, data) => this.handleChange(e, data, 'editLeads')} placeholder='Leads...' />
                                        </Form.Field>
                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <label className="required">Start Date</label>
                                                <Form.Input onChange={(e, data) => this.handleChange(e, data, 'editStartDate')} value={this.state.editStartDate} type="date" />
                                            </Form.Field>
                                            <Form.Field>
                                                <label >Finish Date</label>
                                                <Form.Input onChange={(e, data) => this.handleChange(e, data, 'editFinishDate')} value={this.state.editFinishDate} type="date" />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Estimated Man Hours</label>
                                                <Form.Input onChange={(e, data) => this.handleChange(e, data, 'editManHours')} value={this.state.editManHours} type="number" />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="required">Status</label>
                                                <Form.Select value={this.state.editStatus} onChange={(e, data) => this.handleChange(e, data, 'editStatus')} fluid options={this.state.statusList} placeholder='Status' />
                                            </Form.Field>
                                        </Form.Group>
                                        <Form.Field>
                                            <label >Comments</label>
                                            <Form.TextArea value={this.state.editComments} onChange={(e, data) => this.handleChange(e, data, 'editComments')} placeholder='Comments...' />
                                        </Form.Field>
                                    </Form>
                                </Modal.Description>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button onClick={() => this.editWP()} color="green">
                                    Proceed <Icon name='right chevron' />
                                </Button>
                            </Modal.Actions>
                        </Modal>
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
        approvedPackages: state.ApprovedPackages,
        WPList: state.WPList,
        userData: state.userData
    };
}

export default connect(mapStateToProps, { getWPs, getAllWPs })(AllTasks)

