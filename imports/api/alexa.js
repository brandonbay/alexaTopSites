import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import cheerio from 'cheerio';

const ALEXA_SITES_URL = 'http://www.alexa.com/topsites';
const HEADERS = {'Access-Control-Allow-Origin': '*', 'Upgrade-Insecure-Requests': 1};
const RANK_CLASS_NAME = '.number';
const TEXT_TAGS = ['article', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'main', 'p', 'section', 'span', 'textarea'];

export const Alexa = new Mongo.Collection('alexa');
var globalParseStart;

if (Meteor.isServer) {
    Meteor.publish('alexa', function alexaPublication() {
        return Alexa.find({});
    });

    var fetchResult = function() {
        HTTP.call('GET', ALEXA_SITES_URL, {headers: HEADERS}, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                Alexa.remove({});
                parseResult(response);
            }
        });
        return true;
    };

    var parseResult = function(result) {
        let $ = cheerio.load(result.content);
        let siteListings = $('.site-listing');
        siteListings.each((i, site) => {
            let url = $(site).find('a').contents()[0].data.toLowerCase();
            let rank = parseInt($(site).find(RANK_CLASS_NAME).contents()[0].data);
            if (url) {
                if (url.indexOf('http://') != 0) {
                    url = 'http://' + url;
                }
                getSiteData(url, site, rank);
            }
        });
    };

    var getSiteData = function(url, site, rank) {
        var parseStart = new Date();
        let result = HTTP.get(url, {headers: HEADERS}, (error, result) => {
            if (error) {
                console.log(error);
                let parseTime = new Date().getTime() - parseStart.getTime();
                Alexa.insert({
                    url: url,
                    rank: rank,
                    wordCount: "ERROR",
                    parseTime: parseTime,
                    headers: null
                });
            } else {
                let $ = cheerio.load(result.content);
                let body = $('body');
                let wordCount = 0;
                body.children().each((i, elem) => {
                    if (elem.type === 'tag' && TEXT_TAGS.indexOf(elem.name) >= 0) {
                        wordCount += $(elem).text().split(/\s+/).length;
                    }
                });
                let parseTime = new Date().getTime() - parseStart.getTime();

                Alexa.insert({
                    url: url,
                    rank: rank,
                    wordCount: wordCount,
                    parseTime: parseTime,
                    headers: result.headers
                });
            }
        });
    };
}

if (!Meteor.isServer) {
    var fetchResult = function() {
        // Just so the client thinks it's doing something
    }
}

Meteor.methods({
    'alexa.fetch'() {
        if (globalParseStart === undefined) {
            globalParseStart = new Date();
            Alexa.remove({});
            Alexa.insert({'rank': 'Loading...'});
            fetchResult()
        }
    }
});