const { Thought, User } = require('../models');
const { findOneAndUpdate } = require('../models/User');

const ThoughtController = {

    getAllThoughts(req, res){
        Thought.find({})
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => res.status(400).json(err));
    },

    getThoughtById({ params }, res){
        Thought.findOne({ _id: params.thoughtId})
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .select('-__v')
            .then(dbThoughtData => {
                if(!dbThoughtData){
                    res.status(400).json({ message: 'No thought with this ID' })
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch( err => res.status(400).json(err) );
    },

    createThought({ body }, res){
        Thought.create(body)
            .then( ({ _id }) => {
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    { $push: {thoughts: _id }},
                    { new: true }
                );
            })
            .then(dbThoughtData => {
                if(!dbThoughtData){
                    res.status(404).json({ message: 'No thought with this ID'});
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch( err => res.status(400).json(err));
    },

    updateThought({ params, body }, res){
        Thought.findOneAndUpdate({ _id: params.thoughtId }, body, { new: true, runValidators: true })
            .then( dbThoughtData => {
                if(!dbThoughtData){
                    res.status(404).json({ message: 'No thought with this ID' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => res.status(400).json(err) );
    },

    removeThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId })
        .then( ({ _id }) => {
            return User.findOneAndUpdate(
                { _id: params.userId },
                { $pull: { thoughts: _id }},
                { new: true }
            );
        })
        .then(dbThoughtData => {
            if(!dbThoughtData){
                res.status(404).json({ message: 'No thought with this ID'});
                return;
            }
            res.json(dbThoughtData);
        })
        .catch( err => res.json(err) );
    },

    addReaction({ params, body }, res){
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reaction: body }},
            { new: true }
        )
            .then(dbThoughtData => {
                if(!dbThoughtData){
                    res.status(404).json({ message: 'No thought with this ID' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch( err => res.json(err));
    },

    removeReaction({ params }, res){
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: {reactionId: params.reactionId }}},
            { new: true }
        )
            .then(dbThoughtData => {
                if(!dbThoughtData){
                    res.status(404).json({ message: 'No reaction with that ID'});
                    return;
                }
                res.json(dbThoughtData)
            })
            .catch(err => res.status(400).json(err));
    }
}


module.exports = ThoughtController;