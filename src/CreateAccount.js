/**
 * Class representing the create account page
 * @version 1.0
 * @author Arjun Verma
 */

import React, {Component} from 'react';
import {Typography, Container, Paper, TextField, Button} from '@material-ui/core';
import {create} from './Backend/Database';

class CreateAccount extends Component {
    /**
     * Constructor for the class
     * Sets the state to contain a boolean representing the validity of a username
     * @param {*} props Props for creating a React Component
     */
    constructor(props) {
        super(props);
        this.state = {
            invalidUsername: false
        };
    }

    /**
     * Post call for creating an account
     */
    create = async() => {
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            await create(email, password);
            document.location.href = ('/');
        } catch (error) {
            this.setState({
                invalidUsername: true
            });
        }
    }

    /**
     * Renders the UI components of the Create Account page
     */
    render() {
        return (
            <div style={{height: "100vh"}}>
                <div style = {{backgroundColor: "whitesmoke", height: "100vh"}}>
                    <Container>
                        <Typography style={{paddingTop: "10%", marginBottom: "-5%", textAlign: "center"}} component="h1" variant="h3">
                            Create an Account
                        </Typography>
                    </Container>
                    <Container component = "main" maxWidth = "sm" style={{paddingTop: "5%"}}>
                        <Paper style={{backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center"}} elevation={24}>
                            <form>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    label="Username"
                                    id="username"
                                    error = {this.state.invalidUsername}
                                    autoFocus
                                    style={{width: "80%", marginLeft: "10%"}}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    id="password"
                                    style={{width: "80%", marginLeft: "10%"}}
                                />
                                <Button
                                    onClick = {this.create}
                                    fullWidth
                                    variant="contained"
                                    style={{width: "80%", marginLeft: "10%", marginTop: "3%", marginBottom: "5%"}}
                                >
                                    Create Account!
                                </Button>
                            </form>
                        </Paper>
                    </Container>
                </div>
            </div>
        );
    }
}

export default CreateAccount;