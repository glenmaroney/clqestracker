import React, { Component } from 'react';
import './Unauthorized.css';
import { NavLink } from 'react-router-dom';

class Unauthorized extends Component {

    render() {

        return (
            <div>
                <h1>Unauthorized, please return to login</h1>
                <NavLink to='/'>GO TO LOG IN </NavLink>
            </div>
        );
    }
}

export default Unauthorized;
