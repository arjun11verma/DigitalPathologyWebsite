/**
 * Class representing the Homepage
 * @version 1.0
 * @author Arjun Verma
 */

import React, { Component } from 'react';
import { AppBar, Typography, Grid, Button } from '@material-ui/core';

import { app, check, logoutCurrentUser } from './Backend/Database';

/**
 * Inner class representing a linked button
 */
class CleanButton extends Component {
    /**
     * Constructor for the button
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * Defines the action called on the button click
     * If provided with a link, redirects the user to that link
     */
    click = () => {
        if (this.props.logoutTask !== undefined && this.props.logoutTask !== null) this.props.logoutTask();
        if (!this.props.link.includes('//')) document.location.href = this.props.link;
    }

    /**
     * Renders the UI button component
     */
    render() {
        return (
            <div>
                <Button variant="contained" onClick={this.click} style={{ borderRadius: 15, backgroundColor: 'white', fontFamily: "Garamond", margin: "10px" }}>
                    {this.props.text}
                </Button>
            </div>
        );
    }
}

class Home extends Component {
    /**
     * Constructor for the homepage
     * Sets the state to contain a String list for the parts of the webpage URL, an int for the length of the URL, and a String for the welcoming text 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            email: document.location.href.split('/'),
            length: document.location.href.split('/').length - 1,
            welcomeText: "Welcome to Digital Pathology, a website for expanding global access to pathologogy through modern technology. Please log in."
        };
    }

    /**
     * Called when the webpage is opened
     * Checks if the user is logged in, and promptly redirects him/her 
     */
    componentDidMount = () => {
        check().then((loggedIn) => {
            if (loggedIn && !this.state.email.includes("Homepage")) {
                document.location.href = "./Homepage/" + app.currentUser.profile.email;
            }
        });

        if (this.state.email.includes("Homepage")) {
            this.setState({
                welcomeText: "Welcome user " + this.state.email[this.state.length] + "!"
            })
        }
    }

    /**
     * Renders the UI of the Homepage
     */
    render() {
        return (
            <div style={{ height: "100vh" }}>
                <div style={{ backgroundColor: "whitesmoke", height: "100vh" }}>
                    <AppBar style={{ backgroundColor: "lavender", position: "static" }}>
                        <Grid container alignItems="center" direction="row">
                            <Grid item style={{ padding: "10px" }}>
                                <Typography variant="h3" style={{ fontFamily: "Garamond", color: "grey" }}> Digital Pathology </Typography>
                                <Typography variant="h6" style={{ fontFamily: "Garamond", color: "grey" }}> Expanding Oncology </Typography>
                            </Grid>
                            <CleanButton text="Pathology Portal" link={"./" + this.state.email[this.state.length] + "/PathPortal"} />
                            <CleanButton text="Login" link="./Login" />
                            <CleanButton text="Logout" link="/" logoutTask={() => logoutCurrentUser()} />
                            <CleanButton text="Create Account" link="/CreateAccount" />
                        </Grid>
                    </AppBar>

                    <Typography variant="h5" style={{ fontFamily: "Garamond", margin: 10 }}>{this.state.welcomeText}</Typography>
                    <Typography variant="h5" style={{ fontFamily: "Garamond", margin: 10 }}>This website currently exists for purely research purposes. In no way shape or form should it be used to provide actual cancer diagnoses.</Typography>
                </div>
            </div>
        );
    }
}



export default Home;