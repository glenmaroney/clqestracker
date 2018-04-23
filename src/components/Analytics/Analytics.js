import React, { Component } from 'react';
import './Analytics.css';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import NavBar from '../NavBar/NavBar';
import axios from 'axios';
import {Dimmer, Loader} from 'semantic-ui-react';
import { getAnalyticsAll, getAnalyticsByPackage } from '../../ducks/reducer';
import { connect } from 'react-redux';

class Analytics extends Component {
    constructor() {
        super()
        this.state = {
            loading:true,
            data: [
                ['Category', 'Opportunity', 'PackageName', 'Value']
            ]
        }
    }

    componentWillMount(){
        axios.get('/auth/me').then(res => { 
            console.log('auth result',res)
            if (!res.data) {
                return this.props.history.push('/401')
            }
        }).catch(err=>{
            console.log(err)
            return this.props.history.push('/401')
        })
    }

    reload = () => {
        let newArr = [['Category', 'Opportunity', 'PackageName', 'Value']]
        this.props.Data.map(e => {
            newArr.push([e.Category, e.Opportunity, e.PackageName, e.Value])
        })
        this.setState(
            { data: newArr }
        )
    }

    componentDidMount() {
        if (this.props.selectedPackage === 0) {
            this.props.getAnalyticsAll().then(()=>{
                this.setState({loading: false})
            })
        }
        else {
            this.props.getAnalyticsByPackage(this.props.selectedPackage).then(()=>{
                this.setState({loading: false})
            })
        }
        this.reload()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({loading: true})
        if (nextProps.selectedPackage === 0) {
            this.props.getAnalyticsAll()
        }
        else {
            this.props.getAnalyticsByPackage(nextProps.selectedPackage)
        }
        this.reload()
        this.setState({loading: false})
    }

    render() {

        return (
            <div>
                <NavBar />
                <div className="Main">
                    {!this.state.loading ?
                        <PivotTableUI
                            data={this.state.data}
                            onChange={s => this.setState(s)}
                            {...this.state}
                        />
                        :
                      
                            <Loader active content='Loading' />
                     
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        userData: state.userData,
        Data: state.Data
    };
}

export default connect(mapStateToProps, { getAnalyticsAll, getAnalyticsByPackage })(Analytics)

