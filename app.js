var io = require('socket.io-client'),
    telldus = require('telldus-core-js');

var port = '80',
        server =  'thing.everymote.com';


var connectThing = function(thing){
        console.log(thing);
        var socket = io.connect('http://' + server + ':' + port + '/thing',
                {"force new connection":true 
                        ,'reconnect': true
                        ,'reconnection delay': 5000
                        ,'max reconnection attempts': 100000000000000000});
        
        thing.socket = socket;
        socket.on('connect', function () {
                console.log('connected');
                socket.emit('setup', thing.settings);
        }).on('doAction', function (action) {
                console.log(action);
                thing.handleAction(action);
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
var getActionControles = function(metods){
        var actionControles = [];

        if (metods.indexOf('TURNON') != -1) {

                actionControles.push({"type":"button", "name":"On", "id":"1"});
        }
        if (metods.indexOf('TURNOFF') != -1) {
                actionControles.push({"type":"button", "name":"Off", "id":"0"});
        }
        if (metods.indexOf('DIM') != -1){
                actionControles.push({"type":"range", "name":"Dim", "id":"2", "min":0, "max":255, "curentState":255});
        }
      return actionControles;
};

var build = function (tdThing){

     tdThing.settings = { 
                "name":tdThing.name,
                "id":tdThing.id,
                "quickAction":{"type":"button", "name":"Switch", "id":"switch"},
                "actionControles":  getActionControles(tdThing.metods)
        };      
      var lampOn = false;
      var dimLevl = 0;
      tdThing.handleAction = function(action){
        if (action.id === '1') {
              telldus.turnOn(tdThing.id);
              lampOn = true;  
        }
        else if (action.id === '0'){
                telldus.turnOff(tdThing.id);
                lampOn = false;
        }
        else if (action.id === '2'){
                dimLevl = action.value;
                tdThing.socket.emit('updateActionControlerState', {"id":action.id, "curentState":dimLevl});
                telldus.dim(tdThing.id, parseInt(dimLevl,10));
                lampOn = true; 
               
        }
        else if (action.id === 'switch'){
                if(lampOn){
                        telldus.turnOff(tdThing.id);
                }else{
                        telldus.turnOn(tdThing.id);
                }
                lampOn = !lampOn; 
        }

      };

       return tdThing;
};

var createThing = function(tdThings){
        var things = tdThings.map(build);
        connectThings(things);
};     

//exports.start = function(){
    var tdThings = telldus.getDevices();
	createThing(tdThings);
	 console.log("end");
//}

process.on('uncaughtException', function(err){
        console.log('Something bad happened: ');
        console.log(err);
        process.exit(1);
});
