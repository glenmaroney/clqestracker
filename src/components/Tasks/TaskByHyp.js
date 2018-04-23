import React, { Component } from 'react';
import './Tasks.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { Table, Button, Dimmer, Loader, Segment } from 'semantic-ui-react'
import { getAllWPsByHyp } from '../../ducks/reducer';
import { connect } from 'react-redux';
import moment from 'moment';

class Tasks extends Component {
    constructor(props) {
        super(props)
        this.state = {
            taskData: [],
            loading:true
        }
    }

    componentDidMount() {
        this.props.getAllWPsByHyp(this.props.id).then(()=>{
            this.setState({ taskData: this.props.WPList, loading: false })
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            taskData: nextProps.WPList
        })
    }

    render() {
        return (
            <div className="TaskTable">
                {!this.state.loading ?
                    <ReactTable
                        data={this.state.taskData}
                        headerStyle={{ color: 'red' }}
                        columns={[
                            {
                                Header: "",
                                columns: [
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
                                        accessor: "Status"
                                    },
                                    {
                                        Header: "Start",
                                        accessor: "Start",
                                        Cell: ({ row }) => (row._original.Start ? `${moment(row._original.Start).format("YYYY-MM-DD")}` : null)
                                    },
                                    {
                                        Header: "Finish",
                                        accessor: "Finish",
                                        Cell: ({ row }) => (row._original.Finish ? `${moment(row._original.Finish).format("YYYY-MM-DD")}` : null)
                                    },
                                    {
                                        Header: "Est Man Hr",
                                        accessor: "EstimatedHours"
                                    },
                                    {
                                        Header: "Comments",
                                        accessor: "Comments"
                                    }
                                ]
                            }
                        ]}
                        showPagination={false}
                        defaultPageSize={this.state.taskData.length}
                        className="-highlight"
                    />
                    :
                   <Segment>
                            <Loader active content='Loading' />
                      </Segment>
                    
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        WPList: state.WPList,
        userData: state.userData
    };
}

export default connect(mapStateToProps, { getAllWPsByHyp })(Tasks)

