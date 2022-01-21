const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context,) => {
            if(context.user) {
                const userData = await User.findOne({})
                .select('-__V -password')
                .populate('books')
                return userData;
            }
            throw new AuthenticationError('User is not logged in')
        },
    },
    Mutation: {
         addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
               throw new AuthenticationError('No user found with this email address');   
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Credentials not valid');
            }
            
            const token = signToken(user);

            return {token, user};
        },

        saveBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $addToSet: { savedBooks: args.input } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Must be logged in');
        },
        removeBook: async (parent, { bookId }, context) => {
             const username = context.user.username;
               return User.findOneAndUpdate(
                  { username },
                  { $pull: { savedBooks: { bookId } } },
                  { new: true }
                )
}    }    }   

module.exports = resolvers;