var express = require('express')
var path = require('path')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const session = require('express-session');

app = express();
app.set('port', 3002);

// set up session (in-memory storage by default)
app.use(session({secret: "This is a big long secret lama string."}));

// setup body parsing for form data
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup handlebars and the view engine for res.render calls
// (more standard to use an extension like 'hbs' rather than
//  'html', but the Universiry server doesn't like other extensions)
app.set('view engine', 'html');
app.engine('html', expressHandlebars({
    extname: 'html',
    defaultView: 'default',
    helpers: require('./config/handlebars-helpers'),
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.use(express.static(path.join(__dirname, 'static')))

var server = app.listen(app.get('port'), function () {
    console.log("Server started...")
});

app.get("/items", function (req, res){
    res.render("items");
});

app.get("/item_view", function (req, res){
    res.render("item_view");
});

app.post("/add-to-cart/:id", function (req, res){
    //here is where you will add the item to the cart
    //id is in req.params.id
    //quantity is in req.body.quantity
    //hint: quantity is a string right now, convert it to an int with parseInt(...)


    //redirect to checkout after adding to cart
    res.redirect("/checkout")
});

app.get("/checkout", function (req, res) {
    //YOUR JOB - Replace this with the real cart from the session
    //cart = req.session.cart;
    cart = [ 
        { id: 1, quantity: 2},
        { id: 2, quantity: 3},
        { id: 3, quantity: 4}
    ]

    //if the cart exists, pass it to the checkout template
    if (cart) {
        //we are going to store the actual objects and counts here
        var items = [];

        //how many items are in the cart
        var total_items = cart.length;

        //how many have we processed so far
        var i = 0;

        //loop through all items in the cart
        cart.forEach(cart_entry => {
            //get the id from the cart
            var item_id = cart_entry.id;
            //get the count from the cart
            var item_quantity = cart_entry.quantity;

            //grab the actual object with that id from the DB
            Item.findOne({ where: { id: item_id } }).then((item) => {

                //add the actual item object and count to the items array
                items.push({
                    name: item.name,
                    quantity: item_quantity,
                    cost: item_quantity * item.cost
                });

                //increased total processed
                i++;

                //if we have processed all of them
                //render the checkout template
                if (i == total_items) {
                    console.log(items);
                    res.render("checkout", { cart: items });
                }
            });
        });
    }else{
        //if the cart doesn't exist, pass an empty cart to checkout template
        res.render("checkout", {cart: []} );
    }
});