const express = require("express");
const date = require(__dirname + "/date.js");

const app = express();

const items = ["Buy food", "Cook food", "Eat food"];
const workItems = [];

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function (req, res) {

    const day = date.getDate();
    
    res.render("list", { listTitle: day, newListItems: items });
})

app.post("/", (req, res) =>{

    const item = String(req.body.addItem);

    if(req.body.list === "Work List"){
        workItems.push(item);
        res.redirect("/work");

    }else{
        items.push(item);
        res.redirect("/");
    }

})

app.get("/work", (req, res)=>{
    res.render("list", {listTitle: "Work List", newListItems: workItems});
})

app.get("/about", (req, res)=>{
    res.render("about");
})

app.listen(3000, function () {
    console.log("Server is running on port 3000.");
})