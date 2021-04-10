var mongoose = require('mongoose')          // allow us to connect to mongo data base on atlas
var Schema = mongoose.Schema                // need our schema for db

mongoose.Promise = global.Promise;

try{
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"))
} catch(error){
    console.log("could not connect");
}

mongoose.set('useCreateIndex', true)

// Movie schema
var movieSchema = new Schema({
    title: {type: String, required : true},    // title of movie
    imageUrl: {type: String},                      // url to cover of movie
    release: {type: Date, required : true},     // release date
    // movie genre
    genre: {type: String, required : true, enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western']},
    // characters in movie
    characters: {type : [{characterName: String, actorName: String}], required : true}, 
    avgRating : {type : [Number]}
});

//return the model to server
module.exports = mongoose.model('Movie', movieSchema);