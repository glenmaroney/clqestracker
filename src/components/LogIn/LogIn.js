import React, { Component } from 'react';
import './LogIn.css';
import NavBar from '../NavBar/NavBar';
import { Form, Input, Segment, Button, Divider, Modal, Header } from 'semantic-ui-react'
import bcrypt from 'bcryptjs';
import randtoken from 'rand-token';
import axios from 'axios';
import swal from 'sweetalert';
import {getUser, getApprovedPackages} from '../../ducks/reducer';
import { connect } from 'react-redux';

class LogIn extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errMsg: ''
        }
    }

    handleChange = (e, data, name) => {
        let newState = {}
        newState[name] = data.value
        this.setState(newState)
    }

    login() {
        //1. Check this email exists in the system - else return message (email doesnt match our system)
        if (this.state.email === '' || this.state.password === '') {
            this.setState({
                errMsg: 'Email & password are both required'
            })
        }
        else {
            axios.get(`/api/checkEmail/${this.state.email}`).then((res) => {
                //If found a row, then proceed to check if it is in initial log in or not?
                if (res.data.recordsets[0][0]) {
                    if (!res.data.recordsets[0][0].Password) {
                        return alert('Click initial login button to set up your password')
                    }
                    else {
                        var match = bcrypt.compareSync(this.state.password, res.data.recordsets[0][0].Password); // boolean result
                        if (match) {
                            //Push user data to store
                            this.props.getUser(res.data.recordsets[0][0])
                            //Get approved Packages if any
                            this.props.getApprovedPackages(res.data.recordsets[0][0].PersonID)
                            this.props.history.push(`/summary/${this.props.selectedPackage}`)
                        }
                        else {
                            this.setState({
                                errMsg: 'Incorrect Password!'
                            })
                        }
                    }
                }
                else {
                    this.setState({
                        errMsg: 'Email not found in the system, please try again'
                    })
                }
            }).catch(err => {
                console.log('err', err)
                this.setState({
                    errMsg: 'Error connecting to the database please contact support!'
                })
            })
        }
    }

    initialLogin() {

        document.body.style.cursor = 'wait'
        this.setState({ loading: true, disableBtn: true })
        if (this.state.email === '') {
            this.setState({
                errMsgDialog: 'Email required'
            })
            return;
        }
        else {
            //Check password is null
            axios.get(`/api/checkEmail/${this.state.email}`).then((res) => {
                if (res.data.recordset[0]) {
                    if (res.data.recordsets[0].length > 0) {
                        if (!res.data.recordset[0].Password) {
                            //send URL with token
                            var token = randtoken.generate(16);
                            axios.put(`/api/addToken/${this.state.email}`, { token: token }).then((res) => {
                                if (res.data.recordsets[0].length !== 0) {
                                    axios.post(`/api/emailForgotPWLink`, { email: this.state.email, token: token }).then((res) => {
                                        this.setState({ loading: false, disableBtn: false, modal: false })
                                        document.body.style.cursor = 'default'
                                        swal({
                                            title: "Success!",
                                            text: `Email sent!`,
                                            icon: "success",
                                            button: "OK!",
                                        })
                                    }).catch(err => {
                                        console.log('err', err)
                                        swal({
                                            title: "Error!",
                                            text: `Error sending Email Link, please contact support`,
                                            icon: "error",
                                            button: "Try again!",
                                        })
                                    })
                                }
                            })
                        }
                        else {
                            this.setState({ loading: false, disableBtn: false })
                            document.body.style.cursor = 'default'
                            swal({
                                title: "Error!",
                                text: `Password already exists, not an initial log in!`,
                                icon: "error",
                                button: "Try again!",
                            })
                        }
                    }
                    else {
                        this.setState({ loading: false, disableBtn: false })
                        document.body.style.cursor = 'default'
                        swal({
                            title: "Error!",
                            text: `Email not found!`,
                            icon: "error",
                            button: "Try again!",
                        })
                    }
                }
                else {
                    this.setState({ loading: false, disableBtn: false })
                    document.body.style.cursor = 'default'
                    swal({
                        title: "Error!",
                        text: `Connection refused, server may be down, contact support.`,
                        icon: "error",
                        button: "Try again!",
                    })
                }
            })

        }
    }

    render() {

        return (
            <div>
                <div className="Login">
                    <Segment padded>
                        <Form.Input onChange={(e, data) => this.handleChange(e, data, 'email')} style={{ width: '100%' }} type="text" placeholder='Email' /><br />
                        <Form.Input onChange={(e, data) => this.handleChange(e, data, 'password')} style={{ width: '100%' }} type="password" placeholder='Password' /><br />
                        <Button onClick={() => this.login()} color="orange" fluid>Login</Button>
                        <div className="errMsg">
                            <p style={{ color: 'red' }}>{this.state.errMsg}</p>
                        </div>
                        <Divider horizontal>Or</Divider>
                        <Form.Group widths='equal'>
                            <Button secondary fluid>Forgot Password</Button><br />

                            <Modal trigger={<Button secondary fluid>Initial Login</Button>}>
                                <Modal.Header>Initial Log in</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                        <Form.Input fluid onChange={(e, data) => this.handleChange(e, data, 'email')} type="email" placeholder='Email' />
                                        <br />
                                        <Button onClick={() => this.initialLogin()} color="green">Send Email</Button>
                                    </Modal.Description>
                                </Modal.Content>
                            </Modal>


                        </Form.Group>
                    </Segment>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log(state.approvedPackages)
    return {
        selectedPackage: state.selectedPackage,
        approvedPackages: state.approvedPackages
    };
}

export default connect(mapStateToProps,{getUser,getApprovedPackages})(LogIn)
