import React, { Component } from 'react';
import './NavBar.css';
import { Menu, Input, Dropdown, Responsive, Sidebar, Container, Image, Icon, Button } from 'semantic-ui-react'
import { NavLink ,withRouter} from 'react-router-dom';
import _ from 'lodash';
import { connect } from 'react-redux';
import {updatePackage,getHypotheses, getAllHypotheses,getCRs, getAllCRs, getWPs,getAllWPs, resetStore,getAllBaseline,getBaseline,getHypVal,getAllHypVal,getCRVal,getAllCRVal} from '../../ducks/reducer';
import axios from 'axios';

const NavBarDesktop = ({ leftItems, rightItems }) => (
    <Menu fixed="top" inverted>
        <Menu.Item style={{ color: 'orange' }} header><div className="headerTxt" >Capex.Reduction</div></Menu.Item>
        {_.map(leftItems, item => <Menu.Item {...item} />)}

        <Menu.Menu position="right">
            {rightItems}
        </Menu.Menu>
    </Menu>
);

const NavBarChildren = ({ children }) => (
    <Container style={{ marginTop: "5em" }}>{children}</Container>
);

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            packageList: [{ key: 0, value: 0, text: 'All' }],
            selectedPackage: '',
            loading: false
        }
    }

    componentDidMount() {
        //Load packages
        axios.get(`/api/getPackagesAll`).then(res => {
            return res.data.recordset.map((e) => {
                this.setState({ packageList: [...this.state.packageList, { key: e.PackageID, value: e.PackageID, name:e.PackageName, text: e.PackageName }] })
            })
        })
        this.setState({selectedPackage: this.props.selectedPackage})
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            selectedPackage: nextProps.selectedPackage
        })
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    handleChange = (e, data) => {
        let name = data.options.filter(x => x.key === data.value).map(x => x.name);

        this.props.updatePackage(data.value,name)
        if(data.value === 0){
            //Load all
            this.props.getAllHypotheses()
            this.props.getAllCRs()
            this.props.getAllWPs()
            //Summary Figures
            this.props.getAllBaseline()
            this.props.getAllHypVal()
            this.props.getAllCRVal()
        }
        else{
            //Load by package
            this.props.getHypotheses(data.value)
            this.props.getCRs(data.value)
            this.props.getWPs(data.value)
            //Summary
            let name = data.options.filter(x => x.key === data.value).map(x => x.name);
            this.props.getBaseline(name)
            this.props.getHypVal(data.value)
            this.props.getCRVal(data.value)
        }
    }

    handlePusher = () => {
        const { visible } = this.state;

        if (visible) this.setState({ visible: false });
    };

    handleToggle = () => this.setState({ visible: !this.state.visible });

    logout = () => {
        axios.get('/Logout').then(res => {
            this.props.history.push('/')
            this.props.resetStore()
        })
    }

    render() {

        let leftItems = [
            { as: NavLink, to: `/hypotheses/${this.state.selectedPackage}`, content: "Hypotheses", key: "Hypotheses" },
            { as: NavLink, to: `/CR/${this.state.selectedPackage}`, content: "CR", key: "CR" },
            { as: NavLink, to: `/tasks/${this.state.selectedPackage}`, content: "Work Planning", key: "Work Planning" },
            { as: NavLink, to: `/analytics/${this.state.selectedPackage}`, content: "Analytics", key: "Analytics" },
            { as: NavLink, to: `/summary/${this.state.selectedPackage}`, content: "Summary", key: "Summary" }

        ];
        let rightItems = [
            <Menu.Item position='right'>
                <Dropdown value={this.state.selectedPackage} name="Package" onChange={(e, data) => this.handleChange(e, data)} placeholder='Select Package' search selection options={this.state.packageList} />
                <Button onClick={()=>this.logout()}style={{marginLeft:'5px'}}color="orange" inverted>Logout</Button>
            </Menu.Item>
        ];

        let burgerItems = [
            <div>
                <Menu.Item inverted as={NavLink} to={`/hypotheses/${this.state.selectedPackage}`} name='Hypotheses'></Menu.Item>
                <Menu.Item as={NavLink} to={`/cr/${this.state.selectedPackage}`} name='CRs'></Menu.Item>
                <Menu.Item as={NavLink} to={`/tasks/${this.state.selectedPackage}`} name='Work Planning'></Menu.Item>
                <Menu.Item as={NavLink} to={`/analytics/${this.state.selectedPackage}`} name='Analytics'></Menu.Item>
                <Menu.Item as={NavLink} to={`/summary/${this.state.selectedPackage}`} name='Summary'></Menu.Item>
            </div>
        ]

        const NavBarMobile = ({
            children,
            leftItems,
            onPusherClick,
            onToggle,
            rightItems,
            visible
        }) => (
                <Menu fixed="top" inverted>
                    <Dropdown item icon='bars' simple>
                        <Dropdown.Menu>
                            <Menu.Item inverted as={NavLink} to={`/hypotheses/${this.state.selectedPackage}`} name='Hypotheses'></Menu.Item>
                            <Menu.Item as={NavLink} to={`/cr/${this.state.selectedPackage}`} name='CR'></Menu.Item>
                            <Menu.Item as={NavLink} to={`/tasks/${this.state.selectedPackage}`} name='Work Planning'></Menu.Item>
                            <Dropdown.Divider />
                            <Menu.Item as={NavLink} to={`/analytics/${this.state.selectedPackage}`} name='Analytics'></Menu.Item>
                            <Menu.Item as={NavLink} to={`/summary/${this.state.selectedPackage}`} name='Summary'></Menu.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu>
            );


        const { activeItem } = this.state
        const { children } = this.props;
        const { visible } = this.state;

        return (
            <div className="NavBar">
                <div>
                    <Responsive {...Responsive.onlyMobile}>
                        <NavBarMobile
                            leftItems={leftItems}
                            onPusherClick={this.handlePusher}
                            onToggle={this.handleToggle}
                            rightItems={rightItems}
                            visible={visible}
                        >
                            <NavBarChildren>{children}</NavBarChildren>
                        </NavBarMobile>
                    </Responsive>
                    <Responsive minWidth={Responsive.onlyTablet.minWidth}>
                        <NavBarDesktop leftItems={leftItems} rightItems={rightItems} />
                        <NavBarChildren>{children}</NavBarChildren>
                    </Responsive>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage,
        userData: state.userData
    };
}

export default withRouter(connect(mapStateToProps,{updatePackage, getAllHypotheses,getHypotheses, getWPs,getAllWPs,getCRs, getAllCRs,getAllBaseline,getBaseline,getHypVal,getAllHypVal,getCRVal,getAllCRVal,resetStore})(NavBar))

