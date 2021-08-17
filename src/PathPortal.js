/**
 * Class for the Pathology Portal Page
 * @version 1.0
 * @author Arjun Verma
 */


import React, { Component } from 'react';
import { Paper, Typography, Grid, AppBar, CardActionArea } from '@material-ui/core';

import { apolloClient } from './Backend/ApolloClient'
import { check } from './Backend/Database';
import gql from "graphql-tag";

/**
 * Inner class for the clickable cards representing the different patients 
 */
class SlideView extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    showImage = () => {
        document.location.href = ('./ImageView/' + this.props.id);
    }

    render() {
        return (
            <div>
                <Paper style={{ backgroundColor: "lavender", borderRadius: 5, margin: 10 }}>
                    <CardActionArea onClick={this.showImage}>
                        <Grid container direction="row">
                            <Typography variant="body1" style={{ fontFamily: "Garamond", margin: 5 }}>Slide Type: {this.props.slide} </Typography>
                            <Typography variant="body1" style={{ fontFamily: "Garamond", margin: 5 }}>Cancer Type: {this.props.cancer} </Typography>
                            <Typography variant="body1" style={{ fontFamily: "Garamond", margin: 5 }}>Date Recorded: {this.props.date} </Typography>
                            <Typography variant="body1" style={{ fontFamily: "Garamond", margin: 5 }}>Comments recieved: {this.props.diagnosis} </Typography>
                        </Grid>
                    </CardActionArea>
                </Paper>
            </div>
        )
    }
}

class PathPortal extends Component {
    /**
     * Constructor for the Pathology Portal class
     * Sets the state to contain a String representing the doctor's username, A String/React Component representing the slides available for diagnosis,
     * a boolean representing if no slides with a certain type of cancer were found, and a boolean representing if no slides with a certain slide type were found
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            username: document.location.href.split('/')[4],
            diagnosedSlides: "",
            undiagnosedSlides: ""
        }
    }

    /**
     * 
     * @param {String} slide Slide type
     * @param {String} cancer Cancer type
     * @param {String} date Date of recording
     * @param {String} id Id of the image
     * @param {String} diagnosis Diagnosis status
     */
    makeSlideBox = (slide, cancer, date, id, diagnosis, slide_id, username) => {
        return (
            <SlideView slide={slide} cancer={cancer} date={date.split(" ")[0]} id={id} diagnosis={diagnosis} slide_id = {slide_id} username = {username}/>
        )
    }

    /**
    * Compares two dates to see which is most recent     
    * @param {String} dateOne 
    * @param {String} dateTwo 
    */
    compareDate = (dateOne, dateTwo) => {
        dateOne = dateOne.split(" ")[0].split("/").map((num) => parseInt(num));
        dateTwo = dateTwo.split(" ")[0].split("/").map((num) => parseInt(num));
        if (dateOne[2] > dateTwo[2]) return true
        else if (dateOne[2] < dateTwo[2]) return false
        else {
            if (dateOne[0] > dateTwo[0]) return true
            else if (dateOne[0] < dateTwo[0]) return false
            else {
                if (dateOne[1] > dateTwo[1]) return true
                else if (dateOne[1] < dateTwo[1]) return false
                else return true
            }
        }
    }

    /**
     * Called when the page is opened
     * Checks if the user is logged in and promptly redirects him/her based on the result
     * Queries the database for all available cancer slide images
     */
    componentDidMount = () => {
        check().then((loggedIn) => {
            if (!loggedIn) window.location.href = "/";
        });

        apolloClient.query({
            query: gql`
            query ImageQuery {
                imageSets {
                    cancer
                    slide
                    timestamp
                    _id
                    diagnosis
                    slide_id
                    username
                }
            }`
        }).then((res) => {
            const response = res.data.imageSets;
            var diagnosedSlides = [];
            var undiagnosedSlides = [];
            var addDiagnosed, addUndiagnosed;

            response.forEach(data => {
                if (data.diagnosis === "N") {
                    addUndiagnosed = true;
                    for (var i = 0; i < undiagnosedSlides.length; i++) {
                        if (this.compareDate(data.timestamp, undiagnosedSlides[i].props.date)) {
                            undiagnosedSlides.splice(i, 0, this.makeSlideBox(data.slide, data.cancer, data.timestamp, data._id, "No", data.slide_id, data.username));
                            addUndiagnosed = false;
                            break;
                        }
                    }
                    if (addUndiagnosed) undiagnosedSlides.push(this.makeSlideBox(data.slide, data.cancer, data.timestamp, data._id, "No", data.slide_id, data.username));
                } else {
                    addDiagnosed = true;
                    for (var a = 0; a < diagnosedSlides.length; a++) {
                        if (this.compareDate(data.timestamp, diagnosedSlides[a].props.date)) {
                            diagnosedSlides.splice(a, 0, this.makeSlideBox(data.slide, data.cancer, data.timestamp, data._id, "Yes", data.slide_id, data.username));
                            addDiagnosed = false;
                            break;
                        }
                    }
                    if (addDiagnosed) diagnosedSlides.push(this.makeSlideBox(data.slide, data.cancer, data.timestamp, data._id, "Yes", data.slide_id, data.username));
                }
            });

            this.setState({
                diagnosedSlides: diagnosedSlides,
                undiagnosedSlides: undiagnosedSlides
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Renders the UI of the Pathology Portal
     */
    render() {
        return (
            <div>
                <AppBar style={{ backgroundColor: "lavender", position: "static" }}>
                    <Grid container alignItems="center" direction="row">
                        <Grid item style={{ padding: "10px" }}>
                            <Typography variant="h3" style={{ fontFamily: "Garamond", color: "grey" }}> Digital Pathology </Typography>
                            <Typography variant="h6" style={{ fontFamily: "Garamond", color: "grey" }}> Expanding Oncology </Typography>
                        </Grid>
                        <Grid item alignItems="center" style={{ marginLeft: "auto" }}>
                            <Typography variant="h3" style={{ fontFamily: "Garamond", color: "grey", margin: 10 }}>Pathology Portal</Typography>
                        </Grid>
                    </Grid>
                </AppBar>

                <Grid container direction="row" style={{}}>
                    <Grid xs={6}>
                        <Paper style={{ height: "84vh", overflowY: "hidden" }}>
                            <Typography variant="h5" style={{ fontFamily: "Garamond", margin: 10 }}>
                                Welcome to the Pathology Portal {this.state.username.split('@')[0]}!
                            </Typography>

                            <Typography variant="h6" style={{ fontFamily: "Garamond", margin: 10 }}>
                                Here, you can view the Whole Slide Images of several patients who have not yet recieved diagnoses. The whole slide images are listed to the right, and you can search for specific types of slides or cancers below. Thank you for contributing to the Global Pathology effort!
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid xs={6}>
                        <Paper style={{ height: "42vh", overflowY: "scroll" }}>
                            <Typography variant="h5" style={{ fontFamily: "Garamond", margin: 10, position: "static" }}>Uncommented Slides</Typography>
                            {this.state.undiagnosedSlides}
                        </Paper>
                        <Paper style={{ height: "42vh", overflowY: "scroll" }}>
                            <Typography variant="h5" style={{ fontFamily: "Garamond", margin: 10, position: "static" }}>Commented Slides</Typography>
                            {this.state.diagnosedSlides}
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default PathPortal;