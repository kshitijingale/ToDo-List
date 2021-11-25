const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config({});

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://admin-kshitij:${process.env.MONGO_PASS}@cluster0.7jlog.mongodb.net/todolistDB`);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Insertion sucessful");
                }
            })
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });
})

app.post("/", (req, res) => {

    const itemName = String(req.body.addItem);
    const listName = String(req.body.list);

    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("Deletion sucessful");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:topic", (req, res) => {
    const customListName = _.capitalize(req.params.topic);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // Create a new list 
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                // Show existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(3000 || process.env.PORT, function () {
    console.log("Server is running on port 3000.");
})

