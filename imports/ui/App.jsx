import React, { Component } from 'react';
import { Alexa } from '../api/alexa.js';
import { createContainer } from 'meteor/react-meteor-data';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import './react-bootstrap-table.css'

var startTime = new Date();

// App component - represents the whole app
class App extends Component {
    renderHeaders(headers) {
        return _.map(headers, (site) => {
            return (
                <Header header={header} key={header._id}/>
            );
        });
    }

    renderAlexa() {
        let siteListings = this.props.alexa;
        return siteListings.map((site) => {
            return (
                <Site site={site} key={site._id} />
            );
        });
    }

    analyzeSites() {
        let siteListings = this.props.alexa;
        let numSites = _.size(siteListings);
        let time = 0;
        let topHeaders = {};
        var headerTracking = {};
        _.each(siteListings, (site) => {
            for (var header in site.headers) {
                if (!headerTracking[header]) {
                    headerTracking[header] = {'count': 0, 'header': header}
                }
                headerTracking[header].count += 1;
            }
        });
        if (_.size(headerTracking) > 0) {
            headerTracking = _.map(headerTracking, (header) => {
                header.frequency = Math.floor(header.count / numSites * 1000) / 1000;
                return header;
            });

            topHeaders = _.first(_.sortBy(_.values(headerTracking), (header) => {
                return -1 * header.count
            }), 20);

            time = new Date() - startTime;

            let tableOptions = { defaultSortName: 'frequency', defaultSortOrder: 'desc' };

            return (
                <div>
                    <p>Total time to parse: {time}ms</p>

                    <BootstrapTable data={topHeaders} options={tableOptions}>
                        <TableHeaderColumn isKey dataField='header' dataSort>Header</TableHeaderColumn>
                        <TableHeaderColumn dataField='frequency' dataSort>Frequency</TableHeaderColumn>
                        <TableHeaderColumn dataField='count' dataSort>Total Count</TableHeaderColumn>
                    </BootstrapTable>
                </div>
            );
        }
        return (
            <div>
                <p>Total time to parse: {time}ms</p>
            </div>
        )
    }

    render() {
        let tableOptions = { defaultSortName: 'rank', defaultSortOrder: 'asc' };
        return (
            <div className="container">
                <header>
                    <h1>Alexa Top Site Analysis</h1>
                </header>

                {this.analyzeSites()}

                <BootstrapTable data={this.props.alexa} options={tableOptions}>
                    <TableHeaderColumn isKey dataField='rank' dataSort>Rank</TableHeaderColumn>
                    <TableHeaderColumn dataField='url' dataSort>Website URL</TableHeaderColumn>
                    <TableHeaderColumn dataField='wordCount' dataSort>Words on First Page</TableHeaderColumn>
                    <TableHeaderColumn dataField='parseTime' dataSort>Time to Analyze (ms)</TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
}

export default createContainer(() => {
    Meteor.call('alexa.fetch');
    Meteor.subscribe('alexa');
    return {
        alexa: Alexa.find({}).fetch()
    };
}, App) ;
