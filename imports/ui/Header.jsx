import React, { Component } from 'react';
import { HTTP } from 'meteor/http';

// App component - represents the whole app
export default class Header extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.header.header}</td>
                <td>{this.props.header.frequency}%</td>
                <td>{this.props.header.count}</td>
            </tr>
        );
    }
}