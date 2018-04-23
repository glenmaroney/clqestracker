import React, { Component } from 'react';
import NavBar from '../NavBar/NavBar';
import { Button, Header, Icon, Card } from 'semantic-ui-react'
import Cards from './Cards';
import Chart from './Chart';
import axios from 'axios';
import { connect } from 'react-redux';
import { getAllBaseline, getBaseline, getAllHypVal, getHypVal, getAllCRVal, getCRVal } from '../../ducks/reducer';

class Summary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Baseline: 0,
            HypVal: 0,
            CRVal: 0
        }
    }

    componentWillMount(){
        axios.get('/auth/me').then(res => { 
            if (!res.data) {
                return this.props.history.push('/401')
            }
        }).catch(err=>{
            console.log(err)
            return this.props.history.push('/401')
        })
    }

    componentDidMount() {
        if(this.props.selectedPackage === 0){
            this.props.getAllBaseline()
            this.props.getAllHypVal()
            this.props.getAllCRVal()
        }
        else{
            this.props.getBaseline(this.props.selectedPackageName)
            this.props.getHypVal(this.props.selectedPackage)
            this.props.getCRVal(this.props.selectedPackage)
        }
        this.setState({
            Baseline: this.props.Baseline,
            HypVal: this.props.HypVal,
            CRVal: this.props.CRVal
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            Baseline: nextProps.Baseline,
            HypVal: nextProps.HypVal,
            CRVal: nextProps.CRVal
        })
    }

    render() {

        return (
            <div>
                <NavBar />
                <div className="Main">
                    <div className="cards">
                        <Cards BaselineFig={this.state.Baseline} HypVal={this.state.HypVal} CRVal={this.state.CRVal} />
                    </div>
                    <Chart Baseline={this.state.Baseline} HypVal={this.state.HypVal} CRVal={this.state.CRVal} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        selectedPackageName: state.selectedPackageName,
        Baseline: state.Baseline,
        HypVal: state.HypVal,
        CRVal: state.CRVal,
        userData: state.userData
    };
}

export default connect(mapStateToProps, { getAllBaseline, getBaseline, getAllHypVal, getHypVal, getAllCRVal, getCRVal })(Summary)
