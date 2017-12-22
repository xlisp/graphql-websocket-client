const PORT = 3000;

const koa = require('koa');
const app = new koa();

app.use(require('koa-body')());

const route = require('koa-route');

const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa');
const schema = require('./schema');
app.use(route.post('/graphql', graphqlKoa(context => {
    return { schema, context, };
})));

// app.use(route.all('/graphiql', graphiqlKoa({ endpointURL: '/graphql', subscriptionsEndpoint: `ws://localhost:${PORT}/subscription` })));

app.use(route.all('/graphiql', graphiqlKoa({ endpointURL: 'http://localhost:2223/graphql', subscriptionsEndpoint: `ws://localhost:2223/loc/` })));


const server = require('http').createServer(app.callback());

const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
server.listen(PORT, () => {
    console.log(`Apollo Server is now running on http://localhost:${PORT}`);
    SubscriptionServer.create({
        schema,
        execute,
        subscribe,
    }, {
        server,
        path: '/subscription',
    });
});