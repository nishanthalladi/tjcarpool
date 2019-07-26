sharedPref = {};

cycle();


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

function sendRequest(){
    var reqName = document.getElementById("reqName").value;
    var reqTo = document.getElementById("reqTo").value;
    var reqFrom = document.getElementById("reqFrom").value;
    var reqNum = document.getElementById("reqNum").value;
    var reqTime = document.getElementById("reqTime").value;
    console.log("hello");
    var toHash = reqName + reqTo + reqFrom + reqNum + reqTime;
    var hash = toHash.hashCode();
    var new_pool = {hash: hash, name: reqName, start: reqFrom, destination: reqTo, num: reqNum, time: reqTime};
    
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

function cycle(){
    
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


function makeCard(hash, name, to, from, num, time, timestamp){
    var _div = document.createElement('div');
    _div.id = hash;
    _div.className = "card text-white bg-info text-center mb-1";
    // _div.style.max-width = "18rem";
    
    var inner_1 = document.createElement('div');
    _div.className = "card-body";
    
    var inner_2 = document.createElement('p');
    var node = document.createTextNode(name + " and " + num + " others want to go from " + from + " to " + to + " at " + time);
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
        // console.log({name: name, start: from, destination: to, num: num, time: time})
    };
    
    inner_1.appendChild(inner_2);
    _div.appendChild(inner_1);
    _div.appendChild(btn);
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

// document.getElementById("send_req_button").addEventListener("click", sendRequest);   