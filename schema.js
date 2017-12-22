const { makeExecutableSchema } = require('graphql-tools');
const { PubSub, withFilter } = require('graphql-subscriptions');

const pubsub = new PubSub();

const db = {
    robots: [],
};

const Query = {
    robots: (root, args, ctx, ast) => db.robots,
}

const Mutation = {
    add_robot: async (_, { name }, ctx, ast) => {
        await Promise.resolve(true);
        const rb = { id: Math.random(), name };
        db.robots.push(rb);
        pubsub.publish('on_robots', rb);
        return rb;
    },
    del_robot: async (_, { id }, ctx, ast) => {
        await Promise.resolve(true);
        const old_robots = db.robots;
        db.robots = db.robots.filter(r => r.id!==id);
        pubsub.publish('on_robots', id);
        return old_robots.length !== db.robots.length;
    },
}

const Subscription = {
    on_robots: {
        subscribe: () => pubsub.asyncIterator('on_robots'),
        resolve: () => db.robots,
    }
}

const resolvers = { Query, Mutation, Subscription };

const fs = require('fs');
const path = require('path');

module.exports = makeExecutableSchema({
    typeDefs: [ fs.readFileSync(path.join(__dirname, './schema.gql'), 'utf8') ], // string array
    resolvers,
});
