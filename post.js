const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    // date:{
    //     type:Date,
    //     default: Date.now
    // },
    pname: String,
    pcontact: String,
    pquantity: Number,
    paddress:String,
    food_type:String,
    img:String
});
module.exports = mongoose.model("post",postSchema);



























// const mongoose = require('mongoose');

// const postSchema = mongoose.Schema({
//     user:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref:"user"
//     },
//     date:{
//         type:Date,
//         deafult: Date.now
//     },
//     content:String,
//     likes:[
//         {
//             type:mongoose.Schema.Types.ObjectId,ref:"user"
//         }
//     ]


// });
// module.exports = mongoose.model("post",postSchema);
