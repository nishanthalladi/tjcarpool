sharedPref = {};

cycle();

$(document).keypress(
  function(event){
    if (event.which == '13') {
      event.preventDefault();
    }
});



String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function toLogin(){
    window.location.href = "https://carpool.sites.tjhsst.edu/login";
}


function toLogout(){
    window.location.href = "https://carpool.sites.tjhsst.edu/logout";
}


function sendRequest(){
    var reqTo = document.getElementById("reqTo").value;
    var reqFrom = document.getElementById("reqFrom").value;
    var reqNum = document.getElementById("reqNum").value;
    var reqTime = document.getElementById("reqTime").value;
    
    reqNum = reqNum.charAt(0).toUpperCase() + reqNum.slice(1);
    reqTime = reqTime.charAt(0).toUpperCase() + reqTime.slice(1);
    
    console.log("reqNum: " + reqNum);
    var toHash = reqTo + reqFrom + reqNum + reqTime;
    var hash = toHash.hashCode();
    var new_pool = {'hash': hash, 'start': reqFrom, 'destination': reqTo, 'num': reqNum, 'time': reqTime};
    
    $.ajax ({
        url: "write_sql",
        type: "get",
        data: new_pool,
        success: function(response) {},
        error: function(stat, err) {}
    });
    // const now = new Date();
    cycle();
}

function obliterate(){
    
}

function cycle(){
    console.log("hello")
    $.ajax ({
        url: "read_sql",
        type: "get",
        success: function(response) {
            response.forEach(function(el){
                toHash_ = el.name+ el.start+ el.destination+ el.num+ el.time
                var elem = document.getElementById(el.hash);
                elem.parentNode.removeChild(elem);
            });
        },
        error: function(stat, err) {}
    });
    
    $.ajax ({
        url: "read_sql",
        type: "get",
        success: function(response) {
            response.forEach(function(el){
                // toHash_ = el.name+ el.start+ el.destination+ el.num+ el.time
                makeCard(el.hash, el.name, el.start, el.destination, el.num, el.time, "");
            });
        },
        error: function(stat, err) {}
    });
}

var fromMarker;
var toMarker;
var bounds;

function submitAddresses(from_addy, to_addy, geocoder, resultsMap, directionsService, directionsDisplay){
    bounds = new google.maps.LatLngBounds();
    geocodeFromAddress(from_addy, to_addy, geocoder, resultsMap, geocodeToAddress, directionsService, directionsDisplay)
    // geocodeToAddress(geocoder, resultsMap)
    // console.log(fromMarker.getPosition() + " " + toMarker.getPosition())
    
}


function geocodeFromAddress(from_addy, to_addy, geocoder, resultsMap, callback, directionsService, directionsDisplay) {
    var address = from_addy
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
        // resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: resultsMap,
            position: results[0].geometry.location
        });
        if (fromMarker != null && fromMarker != undefined){
            fromMarker.setMap(null)
            fromMarker = null
        }
        fromMarker = marker
        bounds.extend(marker.getPosition())
        resultsMap.fitBounds(bounds);
        callback(from_addy, to_addy, geocoder, resultsMap, giveDirs, directionsService, directionsDisplay)
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function geocodeToAddress(from_addy, to_addy, geocoder, resultsMap, callback, directionsService, directionsDisplay) {
    var address = to_addy
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
        // resultsMap.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: resultsMap,
            position: results[0].geometry.location
        });
        if (toMarker != null && toMarker != undefined){
            toMarker.setMap(null)
        }
        toMarker = marker
        bounds.extend(marker.getPosition())
        resultsMap.fitBounds(bounds);
        callback(from_addy, address, directionsService, directionsDisplay)
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function giveDirs(from_addy, to_addy, directionsService, directionsDisplay) {
    directionsService.route({
      origin: from_addy,
      destination: to_addy,
      travelMode: 'DRIVING'
    }, function(response, status) {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === 'OK') {
        // document.getElementById('warnings-panel').innerHTML =
        //     '<b>' + response.routes[0].warnings + '</b>';
        directionsDisplay.setDirections(response);
        // showSteps(response, markerArray, stepDisplay, map);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
}


function makeCard(hash, name, to, from, num, time, timestamp){
    var _div = document.createElement('div');
    _div.id = hash;
    _div.className = "card text-white bg-info text-center mb-1";
    // _div.style.max-width = "18rem";
    
    var inner_1 = document.createElement('div');
    _div.className = "card-body";
    
    var inner_2 = document.createElement('p');
    if (num == "0"){
        var node = document.createTextNode(name + " wants to go from " + to + " to " + from + " at " + time);
    }
    else if (num == "1"){
        var node = document.createTextNode(name + " and " + num + " other want to go from " + to + " to " + from + " at " + time);
    }
    else {
        var node = document.createTextNode(name + " and " + num + " others want to go from " + to + " to " + from + " at " + time);
    }
    inner_2.appendChild(node);
    
    var footer = document.createElement('div');
    _div.className = "card-footer text-muted";
    var node_2 = document.createTextNode(timestamp);
    footer.appendChild(node_2);
    
    
    var btn = document.createElement('a');
    btn.id = "btn" + hash;
    btn.className = "btn btn-light close";
    var node_3 = document.createTextNode("Host");
    btn.appendChild(node_3);
    
    btn.onclick = function(){
        $.ajax ({
            url: "del_sql",
            type: "get",
            // data: {name: name, start: from, destination: to, num: num, time: time},
            data: {hash: hash},
            success: function(response) {},
            error: function(stat, err) {}
        });
        toHash_ = name+ from + to+ num+ time
        var elem = document.getElementById(hash);
        elem.parentNode.removeChild(elem);
        // cycle();
        // console.log({name: name, start: from, destination: to, num: num, time: time})
    };
    var cont = document.createElement('div');
    cont.className = "row container justify-content-md-center";
    
    
    var map_div = document.createElement('div');
    map_div.id = hash + "map_div"
    map_div.style.width = "400px"
    map_div.style.height = "400px"
    map_div.style.display = "none"
    
    var btn_2 = document.createElement('a');
    btn_2.id = hash + "btn2";
    btn_2.className = "btn btn-light close";
    var node_4 = document.createTextNode("Show Map");
    btn_2.appendChild(node_4);
    
    btn_2.onclick = function(){
      var x = document.getElementById(hash + "map_div");
      if (x.style.display != "block") {
          x.style.display = "block";
          document.getElementById(hash + "btn2").style.display = "none"
        var myLatlng = {lat: 38.818747, lng: -77.168755};
        
        var map = new google.maps.Map(document.getElementById(hash + "map_div"), {
          zoom: 14,
          center: myLatlng 
        });
        var geocoder = new google.maps.Geocoder();
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer({map: map});
        submitAddresses(to, from, geocoder, map, directionsService, directionsDisplay);
      }
    };
    
    cont.appendChild(map_div)
    inner_1.appendChild(inner_2);
    inner_1.appendChild(cont);
    _div.appendChild(inner_1);
    _div.appendChild(btn);
    _div.appendChild(btn_2);
    _div.appendChild(footer);
    
    sharedPref[hash] = _div;
    tap = document.getElementById("toAppend");
    tap.appendChild(_div);

}


function makeListElement(hash, name, to, from, num, time, timestamp){
    var _div = document.createElement('li');
    _div.id = hash;
    _div.className = "list-group-item";
    // _div.style.max-width = "18rem";

    var node = document.createTextNode(name + "and" + parseInt(num)-1 + "others want to go from" + from + "to" + to + "at" + time);
    _div.appendChild(node);

    tap = document.getElementById("toAppend");
    tap.appendChild(_div);

}

function initMap() {
    var myLatlng_ = {lat: 38.818747, lng: -77.168755};
    
    var map_ = new google.maps.Map(document.getElementById('fromMap'), {
      zoom: 14,
      center: myLatlng_ 
    });
    var geocoder_ = new google.maps.Geocoder();
    var directionsService_ = new google.maps.DirectionsService;
    var directionsDisplay_ = new google.maps.DirectionsRenderer({map: map_});
    document.getElementById('submitAddresses').addEventListener('click', function() {
      submitAddresses(document.getElementById('reqFrom').value, document.getElementById('reqTo').value, geocoder_, map_, directionsService_, directionsDisplay_);
    });
    // var myLatlng = {lat: -25.363, lng: 131.044};
    
    // var map = new google.maps.Map(document.getElementById('toMap'), {
    //   zoom: 4,
    //   center: myLatlng 
    // });
}
// google.maps.event.addDomListener(window, 'load', initialise);
// document.getElementById("cleanser").addEventListener("click", cycle);  
// console.log("hi")

