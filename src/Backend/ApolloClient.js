/**
 * Client for handling queries and mutations to database
 * @version 1.0
 * @author Arjun Verma
 */

import { accessUri, accessToken } from './Database';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

/**
 * MongoDB GraphQL Client for querying the image and user database
 */
const client = new ApolloClient({
    link: new HttpLink({
        uri: accessUri,
        fetch: async (uri, options) => {
            const token = await accessToken();
            options.headers.Authorization = `Bearer ${token}`;
            return fetch(uri, options);
        }
    }),
    cache: new InMemoryCache()
});

export const apolloClient = client;