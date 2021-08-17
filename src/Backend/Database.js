/**
 * Singleton class for an instance of the MongoDB Realm App
 * @version 1.0
 * @author Arjun Verma
 */

const Realm = require("realm-web");

const appId = "digitalpathology2020-ecrjr";
const accessUri = `https://realm.mongodb.com/api/client/v2.0/app/${appId}/graphql`;

const app = new Realm.App({id: appId, timeout: 10000});

/**
 * Logs in a user with the provided email and password
 * @param {String} email 
 * @param {String} password 
 */
const logIn = async(email, password) => {
    await app.logIn(Realm.Credentials.emailPassword(email, password));
}

/**
 * Creates an Account with the provided email and password
 * @param {String} email 
 * @param {String} password 
 */
const create = async(email, password) => {
    await app.emailPasswordAuth.registerUser(email, password);
}

/**
 * @returns Access token from the current user
 */
const accessToken = async() => {
    if(app.currentUser) {
        await app.currentUser.refreshAccessToken();
        return app.currentUser.accessToken;
    }
}

/**
 * Checks whether the current user is logged in 
 * @returns {Boolean} Login status of the user
 */
const check = async() => {
    return (app.currentUser !== null && await app.currentUser.isLoggedIn);
}

/**
 * Logs out the current user
 */
const logoutCurrentUser = async() => {
    await app.currentUser.logOut();
}

module.exports = {app, check, logIn, accessToken, accessUri, create, logoutCurrentUser};