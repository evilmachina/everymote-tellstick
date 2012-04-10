var io = require('socket.io-client'),
    telldus = require('tellduscore');

var port = '80',
        server =  'm.everymote.com';


var connectThing = function(thing){
        console.log(thing);
        var socket = io.connect('http://' + server + ':' + port + '/thing',
                {"force new connection":true 
                        ,'reconnect': true
                        ,'reconnection delay': 500
                        ,'max reconnection attempts': 10});
        
        var lampOn = false;
        socket.on('connect', function () {
                console.log('connected');
                socket.emit('setup', thing.settings);
        }).on('doAction', function (action) {
                console.log(action);
                thing.handleAction(action);
                /*
                if(action == "On"){
                        tellstick.turnOn(thing);
                        lampOn = true;
                }else if(action== "Off"){
                        tellstick.turnOff(thing);
                        lampOn = false;
                }else{
                        if(lampOn){
                                tellstick.turnOff(thing);

                        }else{
                                tellstick.turnOn(thing);
                        }
                        lampOn = !lampOn;
                }*/
        }).on('connect_failed', function () {
                console.log('error:' + socket );
        }).on('disconnect', function () {
                console.log('disconnected');
        }).on('reconnect', function () {
               console.log('reconnect');
             
        });
};

var connectThings = function (things){
        things.map(connectThing);
}; 

//'TURNON', 'TURNOFF', 'DIM'
var getFunctions = function(metods){
        var functions = [];

        if (metods.indexOf('TURNON') != -1) {
                functions.push({"button":"On"});
        }
        if (metods.indexOf('TURNOFF') != -1) {
                functions.push({"button":"Off"});
        }
        if (metods.indexOf('DIM') != -1){
                functions.push({"button":"+"});
                functions.push({"button":"-"});
        }
      return functions;
};

var build = function (tdThing){

     tdThing.settings = { 
                "name":tdThing.name,
                "id":tdThing.id,
                "quickAction":{"button":"switch"},
                "functions":  getFunctions(tdThing.metods)
        };      



       return tdThing;
};

var createThing = function(tdThings){
        var things = tdThings.map(build);
        connectThings(things);
};     

var tdThings = telldus.getDevices();
createThing(tdThings);

process.on('uncaughtException', function(err){
        console.log('Something bad happened: ' + err);
        process.exit(0);
});
