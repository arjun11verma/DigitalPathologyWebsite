/**
 * Class for the Slide Image Viewing and Diagnosis Page
 * @version 1.0
 * @author Arjun Verma
 */

import React, { Component } from 'react';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { Paper, Grid, Typography, AppBar, TextareaAutosize, Button } from '@material-ui/core';

import { apolloClient } from './Backend/ApolloClient';
import gql from 'graphql-tag';
import axios from 'axios';
import {server_url} from './APIKEYS.js';
import { check } from './Backend/Database';

/**
 * Inner class for displaying the image
 */
class ImageViewCard extends Component {
    /**
     * Constructor for the class
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * Renders the Image UI Component
     */
    render() {
        return (
            <div>
                <Zoom style = {{height: 600}}>
                    <img alt="Slide" src={this.props.src} style={{ width: "50vw", height: 600}} />
                </Zoom>
            </div>
        );
    }
}

const url_list = document.location.href.split('/');

class ImageView extends Component {
    /**
     * Constructor for the class
     * Sets the state to contain a String of image data, a String list representing the URL (which contains the objectID of the image data),
     * a String for the patient's email, a String for the patient's name, a React Component for the diagnosis, and a String for a message above the diagnosis
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            imageData: null,
            objectId: url_list[url_list.length - 1],
            emailUser: null,
            nameUser: null,
            determineDiagnosis: <div>
                <Typography variant="body1" style={{ fontFamily: "Garamond", marginLeft: 10 }}>Please input your comments below. You and the patient will both remain anonymous. </Typography>
                <TextareaAutosize
                    variant="outlined"
                    id='diagnosis'
                    style={{ width: 720, height: 300, marginLeft: 10, fontFamily: "Times New Roman" }}
                ></TextareaAutosize>
                <Button onClick={this.sendDiagnosis} style={{ fontFamily: "Garamond", marginLeft: 10 }}>Send Comments!</Button>
                <Button onClick={this.saveData} style={{ fontFamily: "Garamond", marginLeft: 10 }}>Save your comments without sending!</Button>
            </div>,
            diagnosisMessage: "Thank you so much for volunteering to aid the global pathology effort. Please provide comments on the cancer status of the provided slide image and input them below. Once you have successfully completed your comments, please either click Send Comments to send your comments to the patient and make it visible to other doctors or click Save without Sending to save it so only you can view it."
        };
    }

    // Adjust to update for S3 
    /**
     * Queries the database for the image and user data from the state objectId
     */
    queryImage = async () => {
        apolloClient.query({
            query: gql`
            query ImageQuery($_id: ObjectId!) {
                imageSet(query: {_id: $_id}) {
                    username
                    diagnosis
                    name
                    timestamp
                }
            }`,
            variables: { _id: this.state.objectId }
        }).then((res) => {
            const image = this.processImages(this.getImageFromS3(`${res.data.imageSet.username}/${res.data.imageSet.name}/${res.data.imageSet.timestamp}`));
            const diagnosis = res.data.imageSet.diagnosis;
            this.setState({
                imageData: image,
                emailUser: res.data.imageSet.username,
                nameUser: res.data.imageSet.name
            });

            if (diagnosis !== "N") {
                this.setState({
                    determineDiagnosis: <Typography style={{ marginLeft: 10, fontFamily: "Garamond" }}>{("Former Diagnosis: " + diagnosis)}</Typography>,
                    diagnosisMessage: "This patient has already recieved comments from a pathologist. They can be viewed below."
                });
            } else {
                axios.post(`${server_url}updateCurrentDiagnosis`, { 'patientID': url_list[url_list.length - 1], 'doctorID': url_list[url_list.length - 3] }).then((res) => {
                    console.log(res);
                    if (res.data.using) {
                        this.setState({
                            determineDiagnosis: <Typography style={{ marginLeft: 10, fontFamily: "Garamond" }}>{("Another doctor is currently working on this patient.")}</Typography>,
                            diagnosisMessage: "This patient is currently being looked at by another pathologist."
                        });
                    } else {
                        console.log(res.data.currentDiagnosis);
                        document.getElementById('diagnosis').value = res.data.currentDiagnosis;
                    }
                });
            }
        }).catch(err => {
            console.log(err);
        });
    }

    getImageFromS3 = (imgpath) => {
        var imageData;
        axios.post(`${server_url}getImageS3`, { 'path': imgpath }).then((res) => {
            imageData = res.data.image;
        });
        return imageData;
    }

    /**
     * Creates an ImageView Component from the given image data
     * @param {String} imgData 
     */
    processImages = (imgData) => {
        return <ImageViewCard alt="Slide" src={"data:image/jpeg;base64," + imgData} />;
    }

    /**
     * Sends the diagnosis typed in by the doctor to the patient and saves it to the database
     */
    sendDiagnosis = () => {
        const diagnosis = document.getElementById('diagnosis').value;

        axios.post(`${server_url}sendEmail`, { 'address': "arjunverma1com@gmail.com", 'name': this.state.nameUser, 'message': diagnosis }).then((res) => {
            if (res.status === 200) {
                apolloClient.mutate({
                    mutation: gql`
                                mutation updateImageSet($_id: ObjectId!, $ImageSetUpdateInput: ImageSetUpdateInput!) {
                                    updateOneImageSet(query: {_id: $_id}, set: $ImageSetUpdateInput) {
                                        _id
                                    }
                                }`,
                    variables: {
                        _id: (this.state.objectId),
                        ImageSetUpdateInput: {
                            "diagnosis": diagnosis
                        }
                    }
                }).then((response) => {
                    axios.post(server_url + 'removeCurrentDiagnosis', { 'patientID': this.state.objectId }).then((r) => {
                        document.location.href = "/";
                    });
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                console.log("There was an error with the server");
                console.log(res);
            }
        });
    }

    /**
     * Saves the temporary diagnosis of a doctor
     */
    saveData = async() => {
        axios.post(`${server_url}saveCurrentDiagnosis`, { 'patientID': this.state.objectId, 'currentDiagnosis': document.getElementById('diagnosis').value }).then((res) => {
            window.location.href = '/';
        });
    }

    /**
     * Calls the query image method when the page is opened
     */
    componentDidMount = () => {
        check().then((loggedIn) => {
            if(!loggedIn) window.location.href = "/";
        });

        this.queryImage();
    }

    /**
     * Renders the UI Components of the page
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
                            <Typography variant="h3" style={{ fontFamily: "Garamond", color: "grey", margin: 10 }}>Slide Image Viewing</Typography>
                        </Grid>
                    </Grid>
                </AppBar>

                <Grid container direction="row">
                    <Grid xs={6}>
                        <Paper style={{ height: "640px", position: "static" }}>
                            <Typography variant="body1" style={{ fontFamily: "Garamond", marginLeft: 10 }}>{this.state.diagnosisMessage} </Typography>
                            <br />
                            {this.state.determineDiagnosis}
                        </Paper>
                    </Grid>

                    <Grid xs={6}>
                        <Paper style={{ height: "640px", position: "static" }}>
                            {this.state.imageData}

                            <Typography variant="h6" style={{ fontFamily: "Garamond", textAlign: "center" }}>
                                Click on the image above to pan and zoom full screen.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default ImageView;