import React, { Component } from 'react';
import NavBar from '../NavBar/NavBar';
import { Button, Header, Icon, Card } from 'semantic-ui-react'
import { connect } from 'react-redux';

class Cards extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        let Target = this.props.BaselineFig * 0.65
        let Rem = (this.props.BaselineFig - this.props.HypVal - this.props.CRVal) - Target
        
        const items = [
            {
                header: '22nd Dec Baseline',
                description:  "$" + this.props.BaselineFig.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            },
            {
                header: 'Hypothesised Value Remaining',
                description: "-$" + this.props.HypVal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            },
            {
                header: 'CRs Remaining',
                description: "-$" + this.props.CRVal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            },
            {
                header: 'Remaining',
                description: "$" + ((this.props.BaselineFig - this.props.HypVal - this.props.CRVal) - Target).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            },
            {
                header: 'Target',
                description: "$" + (this.props.BaselineFig * 0.65).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
            }
        ]

        return (
            <Card.Group stackable={true} centered={true} items={items} />
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        userData: state.userData
    };
}

export default connect(mapStateToProps, {})(Cards)
