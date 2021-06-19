//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const lodash = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin123@cluster0.0z2oo.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser : true, useUnifiedTopology: true});

const itemSchema=new mongoose.Schema({
  item: String
});

const listSchema = new mongoose.Schema({
  listName:String,
  items:[itemSchema]
});
const List=new mongoose.model("List",listSchema);
const Item=new mongoose.model("Item",itemSchema);

app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(err)console.log(err);
    else
    {
      res.render("list", {listTitle:"TODAY", newListItems: items});
    }
  });
});
app.get("/:listName",function(req,res){
  const listName=req.params.listName;
  List.findOne({listName:lodash.toLower(listName)},function(err,found){
    if(!err){
      // console.log(found);
      if(!found){
        const list=new List({
          listName:lodash.toLower(listName),
          items:[]
        });
        list.save();
        res.redirect("/"+lodash.toLower(listName));
      }
      else
        res.render("list", {listTitle: lodash.startCase(lodash.toLower(found.listName)), newListItems: found.items});

    }
  })
});
app.post("/:listName", function(req, res){
const listName=req.params.listName;
const item = req.body.newItem;
const addItem= new Item({
  item: item
});
if(listName==="TODAY"){
    addItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({listName:lodash.toLower(listName)},function(err,found){
      if(!err)
      {
        if(found){
        found.items.push(addItem);
        found.save();
        res.redirect("/"+listName);
      }
    }

    });

  }
});

app.post("/remove/:listName",function(req,res){
  // console.log(req.body);
  const listName=req.params.listName;

  if(listName=="TODAY"){
    Item.deleteOne({_id:req.body.val},function(err){
      if(err)console.log(err);
    });
  res.redirect("/");
}
else{
  List.findOne({listName:lodash.toLower(listName)},function(err,found){
    if(!err)
    {
      found.items.pull({_id:req.body.val});
      found.save();
      res.redirect("/"+lodash.toLower(listName));
    }});

}
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
