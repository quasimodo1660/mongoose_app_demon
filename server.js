var express = require('express');
var app = express();

var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
var path = require('path');
app.use(express.static(path.join(__dirname,'./static')));
app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');

app.listen(6789,function(){
    console.log('listening on port 6789');
})

//*************** DB stuff ****************/
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');
mongoose.Promise = global.Promise;

var UserSchema = new mongoose.Schema({
    name:{type:String,required:true,maxlength:50},
    age:{type:Number,required:true,min:1,max:150},
    reviews:[{type:mongoose.Schema.Types.ObjectId,ref:'Review'}]
},{timestamps:true});

mongoose.model('User',UserSchema);
var User = mongoose.model('User')


var QuoteSchema = new mongoose.Schema({
    user:{ type:mongoose.Schema.ObjectId,ref:'User'},
    quote:{type:String,required:true,maxlength:500}
},{timestamps:true});

mongoose.model('Quote',QuoteSchema);
var Quote = mongoose.model('Quote')


var ReviewSchema = new mongoose.Schema({
    _user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    text:{type:String,required:true},
},{timestamps:true});


var Review=mongoose.model('Review',ReviewSchema);


//***************************************/
app.get('/',function(req,res){
    User.find({},function(err,users){
            if(err)
                console.log(err);
            else{
                res.render('index',{u:users});
            }          
        })    
});


app.post('/users',function(req,res){
    var ruser = null; 
    User.find({name:req.body.name},function(err,user){
        if(user.length==0){
            console.log(err);
            ruser = new User({name:req.body.name,age:req.body.age});
                ruser.save(function(err){
                if(err)
                    console.log(err);
                else
                    console.log('successfully added a user!');
            })
        }
        else{
            console.log('find '+user);
        }          
    }) 
    res.redirect('/add');
});

app.get('/add',function(req,res){
    res.render('add')
});

app.post('/addQ',function(req,res){
    User.find({name:req.body.name},function(err,user){
        if(err)
            console.log(err);
        else{
            console.log(user);
            var id=user[0]._id;
            console.log(id);
            var quote = new Quote({user:id,quote:req.body.des})
            quote.save(function(err){
                if(err)
                    console.log(err)
                else{
                    console.log('successfully added a quote!');
                    res.redirect('/quotes');
                }
            })
        }
    });
});

app.get('/quotes',function(req,res){
    Quote.find({}).sort({createdAt:'desc'}).exec(function(err,results){
        if(err)
            console.log(err);
        else{
            console.log(results);
            res.render('quotes',{data:results});
        }
    })
});

app.get('/user/:id',function(req,res){
    User.find({_id:req.params.id},function(err,user){
        if(err)
            console.log(err);
        else{
            console.log(user);
            res.render('userinfo',{data:user});
        }
    })
});

app.post('/user/destroy',function(req,res){
    console.log(req.body.did);
    User.remove({_id:req.body.did},function(err,results){
        if(err)
            console.log(err);
        else{
            res.redirect('/');
        }
    });  
})

app.get('/user/edit/:id',function(req,res){
    User.find({_id:req.params.id},function(err,user){
        if(err)
            console.log(err);
        else{
            console.log(user);
            res.render('edit',{data:user});
        }
    })
});

app.post('/users/edit',function(req,res){
    User.update({_id:req.body.did},{name:req.body.name,age:req.body.age},function(err,results){
        if(err)
            console.log(err);
        else{
            res.redirect('/');
        }
    })
})