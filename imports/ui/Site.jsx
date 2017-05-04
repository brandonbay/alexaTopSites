import React, { Component } from 'react';
import { HTTP } from 'meteor/http';

// App component - represents the whole app
export default class Site extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.site.rank}</td>
                <td><a href={this.props.site.url}>{this.props.site.url}</a></td>
                <td>{this.props.site.wordCount}</td>
                <td>{this.props.site.parseTime}</td>
            </tr>
        );
    }
}