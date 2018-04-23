import React, { Component } from 'react';
import './ForgotPassword.css';
import { Button, Input, Form } from 'semantic-ui-react'
import _ from 'lodash';
import { connect } from 'react-redux';
import { } from '../../ducks/reducer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import swal from 'sweetalert';
import {getUser, editPassword} from '../../ducks/reducer';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            //currentPassword: '',
            confirmPassword: '',
            confirmNewPassword: '',
            errMsg: '',
            errMsgDialog: ''
        }
    }

    forgotPassword = () => {
        //1. Check this email exists in the system - else return message (email doesnt match our system)
        console.log(this.state)
        if (this.state.email === '' || this.state.confirmNewPassword === '' || this.state.confirmPassword === '') {
            return this.setState({
                errMsg: 'All fields are required'
            })
        }
        if (this.state.confirmNewPassword !== this.state.confirmPassword) {
            return this.setState({
                errMsg: 'Passwords dont match'
            })
        }
        else {
            axios.get(`/api/checkEmail/${this.state.email}`).then((res) => {
                //check if token against this email and only continue if they match
                if (res.data.recordsets[0][0].Token === this.props.match.params.token) {
                    //remove token from table
                    axios.put(`/api/removeToken/${this.state.email}`).then((res) => {
                        //Update PW and push to Timesheets/update user Data
                        var hash = bcrypt.hashSync(this.state.confirmNewPassword, 8);

                        this.props.editPassword(this.state.email, hash).then((res) => {
                            this.props.getUser(res.action.payload[0])
                            swal({
                                title: "Success!",
                                text: "Password Updated!",
                                icon: "success",
                                button: "OK!",
                            })
                                .then(
                                    this.props.history.push(`/summary`)
                                )
                        })
                    }).catch(err => { 
                        swal({
                            title: "Error!",
                            text: `Error removing token, please contact support`,
                            icon: "error",
                            button: "Try again!",
                        })
                        console.log('err removing token', err) 
                    })
                }
                else {
                    this.setState({
                        errMsg: 'Error resetting this password, please contact support!'
                    })
                }
            }).catch(err => {
                console.log('err finding email', err)
                this.setState({
                    errMsg: 'Incorrect email, please try again!'
                })
            })
        }
    }

    handleChange = (e, data, name) => {
        let newState = {}
        newState[name] = data.value
        this.setState(newState)
    }


    render() {

        return (
            <div className="ForgotPassword">
                <div style={{ textAlign: 'center' }}>
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>Enter Email</label>
                                <Input onChange={(e, data) => this.handleChange(e, data, 'email')} type='email' />
                            </Form.Field>
                            <Form.Field>
                                <label>Password</label>
                                <Input onChange={(e, data) => this.handleChange(e, data, 'confirmPassword')} type='password' />
                            </Form.Field>
                            <Form.Field>
                                <label>Confirm Password</label>
                                <Input onChange={(e, data) => this.handleChange(e, data, 'confirmNewPassword')} type='password' />
                            </Form.Field>
                            <div className="errMsg">
                                <p style={{ color: 'red' }}>{this.state.errMsg}</p>
                            </div>
                        </Form.Group>
                        <Button color="green" onClick={() => this.forgotPassword()}>Save</Button>
                    </Form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPackage: state.selectedPackage
    };
}

export default connect(mapStateToProps, {getUser, editPassword})(ForgotPassword)

