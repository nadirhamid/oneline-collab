//  NOTE: // this javascript file uses websockets, and uses comet style polling // the  contents will add  two connections
//  one for the syncing of data (messages, drawings, user activity)
// the other for more simple data (new member notifications, sending a message)

window.collab_tool = window.collab_tool || {}; window.collab_tool.settings = { "chalkSize": 1, // in pnitx "nickName": "", "chalkColor": "#000",
};

window.collab_tool.userReady = false;
window.collab_tool.colors = [
      { 
          "title": "blue",
          "hex": "blue"
      },
      {      
        "title": "red",
        "hex": "red"
      },
      {
        "title": "yellow",
        "hex": "yellow"
      },
      {
        "title": "green",
        "hex": "green"
      },
      {
        "title": "black",
        "hex": "black"
      }
  ];

window.collab_tool.welcomeScreen =true;
window.collab_tool.lastUpdate = null;
collab_tool.getSystemClock = function() {
    return  collab_tool.systemTime;
}
//window.collab_tool.init = false;
collab_tool.setup = function() {
  Oneline.setup({
     module: 'collab_tool',
    
     host: "159.100.186.106",
     port: 9999,
     freq:100 
   });

    Oneline.ready(function() {
      Oneline.once({
          "obj": "generic",
          "data": {
              "type": "open",
              "data": {}
          }
      });
    Oneline.pipeline(function(res) {
        
      if (collab_tool.welcomeScreen) {
          collab_tool.welcomeMessage();
      } else {
        if (res.status === 'ok') {

        
            console.log("received response of: ");
            console.log(res.response.type);
            if (res.response.type === 'newMember') {
                if (!res.response.error) {
                      if ( res.response.user.nickName !== collab_tool.settings.nickName) {
                          collab_tool.alertNewMember(res.response.user);
                        } else {
                      // 10seconds behind
                      collab_tool.currentUser = res.response.user;
                      collab_tool.userReady = true; 
                      collab_tool.systemTime = parseFloat(res.response.time);
                      collab_tool.initUI();
                      collab_tool.runCore();
                      setInterval(function() {
                        collab_tool.systemTime += 1.00;
                      }, 1000);
                       }
                } else { // an error
                  collab_tool.warn("Could not join the collab tool the usernme was already taken");
                  document.location.replace(document.location.href); 
                }

            } else if (res.response.type ==='welcome' &&Oneline.isMe(res)) {
                  Oneline.once({
                        "obj": "generic",
                        "data": {
                              "type": "newMember",
                              "data": {
                                    "user": collab_tool.getUser()
                              }
                          }
                    });
            } else if(res.response.type ==='chat' && Oneline.isMe(res)) {
              collab_tool.warn("You have sent this message successfully");
              collab_tool.runCore();
            } else if (res.response.type === 'sync' && Oneline.isMe(res)) {
              var data = res.response;
              var drawings = data.drawings;
              var users = data.users;
              var messages = data.messages;
                console.log("received data");
                console.log(messages);
                console.log(drawings);
                console.log(users);
                setTimeout(function() {
              collab_tool.updateMessages(messages);
                }, 0);
                setTimeout(function() {
              collab_tool.updateDrawings(drawings);
                }, 0);
                setTimeout(function() {
              collab_tool.updateMembers(users);
                }, 0);
              collab_tool.lastUpdate =  collab_tool.getSystemClock();
              collab_tool.runCore();
          }
      }
     }
    }).run();
    });
    

};

collab_tool.updateDrawings = function(drawings) {
   for ( var i in drawings ) {
        if (drawings[i].user_id !== collab_tool.getUserId() || !collab_tool.lastUpdate) {
        var currently =document.getElementById("drawing-" + drawings[i].id);
        if (currently  ===null) {
          var newDrawing = $("<div></div>");
          $(newDrawing).attr("class", "chalk " + drawings[i].chalkColor);
          $(newDrawing).css({"top": drawings[i].topCoords + "px", "left": drawings[i].leftCoords + "px"});
          $(newDrawing).attr("id", "drawing-" + drawings[i].id);
          $("#whiteboard").append(newDrawing );
        }
        }
    }
};

collab_tool.updateMembers = function(members) {
    for ( var i in members) {
          var current = document.getElementById("members-" + members[i].id);
          if (current === null) {
              var newMember = $("<li></li>");
              var memberName = $("<span>" + members[i].nickName  + "</span>");
              $(newMember).append(memberName);
              $(newMember).attr("id", "members-" +members[i].id);
              $(newMember).append(memberName); 
              $("#members").append(newMember) ;
          }
      } ///members
};


collab_tool.updateMessages = function(messages) {
    for ( var i in messages) {
          var current = document.getElementById("message-" + messages[i].collab_tool_messages.id);

          if (current === null) {
              if (messages[i].collab_tool_users.id !== collab_tool.getUserId()
                 ||
                  !collab_tool.lastUpdate
              ) {
              collab_tool.addMessage(messages[i] ); /*
              var newMessage = $("<div></div>");
              var messageUser = $("<span>" + messages[i].user.nickName + "</span>");
              var messageText = $("<span>" + messages[i].message +"</span>");
              $(newMessage).append(messageUser);
              $(newMessage).append(messageText);
              */
              }
         }
      }
};
  

    



collab_tool.getUser = function() {
    return {"nickName": collab_tool.settings.nickName,  "chalkColor": collab_tool.settings.chalkColor };
}

collab_tool.getUserId = function() {
      return collab_tool.currentUser.id;
      //return collab_tool.settings.user_id;
};

collab_tool.getChalkColors = function(hoverable) {
  hoverable = hoverable || false;
  var chalkContainer = document.createElement("ul");
  $(chalkContainer).attr("class","chalkColors");
  for (var i in collab_tool.colors) {
    var li = document.createElement("li");
     if (hoverable) {
      $(li).attr("class", "chalkColor " + collab_tool.colors[i].title + " hoverable");
     } else {
    $(li).attr("class", "chalkColor "  + collab_tool.colors[i].title);
    }
    $(li).data("hex", collab_tool.colors[i].hex);
    $(li).data("color",  collab_tool.colors[i].title); 
    $(li).attr("is-selected", "0");
    $(li).click(function() {
        $(".chalkColor").attr("is-selected", "0");
        $(".chalkColor").each(function() {
            $(this).attr("class", $(this).attr("class") + " "   + $(this).data("color"));
        });
          $(this).attr("is-selected", "1");
          $(this).attr("class", $(this).attr("class") + " " + $(this).data("color") + " selected");
      });
    $(chalkContainer).append(li); 
  }
  return chalkContainer;
};
collab_tool.welcomeMessage = function() {

    collab_tool.welcomeScreen = false;
    var dimMask = document.createElement("div");
    $(dimMask).attr("id", "dimMask");
   
 
    var settings = document.createElement("div"); 
    $(settings).attr("class", "settings-box dialog");
    $(settings).attr("id", "settings");

    var heading = document.createElement("h2");
    $(heading).text("Welcome to the collaboration tool. Please select a nickname and chalk color");
  
    var h4 = document.createElement("h4");
    $(h4).html("Select a chalk color");
    var hr  =document.createElement("hr");
    var chalkColors =  collab_tool.getChalkColors(true);
    $(settings).append(chalkColors); 
    var clear1 = document.createElement("div");
    $(clear1).attr("class", "clear");

    var br1 = document.createElement("br");
    var br2= document.createElement("br");
   var nickname = document.createElement("input");
     $(nickname).attr("placeholder", "e.g Smith");


    $(nickname).attr("id", "nickname");
    var h41 = document.createElement("h4");
    $(h41).html("Select a nickname");
    var hr1 = document.createElement("hr");
    var clr3 = document.createElement("div");
    $(clr3).attr("class", "clear");
    var  button = document.createElement("button");
    $(button).attr("class", "dc_g_button blue ok-button");
    $(button).html("Ok");
    $(button).click( function() {
        var nickName = $("#nickname").val();


        var selectedColor = $(".chalkColor[is-selected=1]").data("hex") || collab_tool.settings.chalkColor;

       //collab_tool.updateInternalConfig(nickName,selectedColor);
        // default color
        collab_tool.changeSettings(nickName,selectedColor);
        $("#dimMask").hide();
        $("#settings").hide();
        //collab_tool.initUI();
        // main generic
        Oneline.acceptAfter(Date.now());
        Oneline.once({
            "obj":"generic", 
            "data": {
              "type": "welcome",
              "data": {
              }

            }
        });
    
      }); 
    $(settings).append(heading); 
    $(settings).append(h4);
    $(settings).append(hr);
    $(settings).append(chalkColors);
    $(settings).append(clear1);
    $(settings).append(br1);
    $(settings).append(br2);
    $(settings).append(h41);
    $(settings).append(hr1);
    $(settings).append(nickname);
    $(settings).append(clr3);
    $(settings).append(button);
    $(document.body).append(dimMask);
    $(document.body).append(settings);

    $(settings).css({"left": (((window.innerWidth /2)  - ($(settings).outerWidth() / 2))) + "px"});
    // get the current drawings
    /* 
    Oneline.generic({ $j"type": "getDrawings",
        "data": {}
    });
      */
};


collab_tool.updateConfig = function(user)  {
    collab_tool.currentUser = user;
  collab_tool.userReady = true;
};

collab_tool.runCore = function() {
    if (collab_tool.lastUpdate) {
        Oneline.once({ 
          "obj": "generic",
          "data": {
            "type": "sync",
              "data": {
                  "lastUpdate": collab_tool.lastUpdate -5
                }
            }});
      } else {
    Oneline.once({ 
          "obj": "generic", 
          "data": {
        "type": "sync",
       "data": {  }
      }});
    }
};
collab_tool.addMessage= function(data) { // message from external user
       
    var theList =$("<li></li>");
    var theUsername= $("<div class='username'>" +data.collab_tool_users.nickName+"</div>");
    var theClear = $("<div class='clear'></div>");
    var theMessage = $("<div class='message'>" +data.collab_tool_messages.message + "</div>");
   $(theList).append( theUsername);
    $(theList).append(theClear);
    $(theList).append(theMessage);
      $(theList).attr("id", "message-" + data.collab_tool_messages.id);
  $("#chatMessages").append(theList);
   var clr =$("<div class='clear'></div>");
   $("#chatMessages").append(clr);
};

collab_tool.alertNewMember = function(data) {
  var newElement = document.createElement("div"); 
  $(newElement).html(data.nickName + " has joined the room! ");
  $(newElement).attr("id", "newUser");
  $(newElement).css({"left": (window.innerWidth / 2) -  $(newElement).width()});
    

  document.body.appendChild(newElement);
  setTimeout(function() {
        $("#newUser").remove();
  }, 1000);
};
 


collab_tool.drawFromData = function(data) { // other peoples pen should be a different color
  var target = document.createElement("div");   
  $(target).css({"top": data.data.topCoords, "left": data.data.leftCoords}); 
  $(target).attr("class", "chalk "  + data.data.chalkColor);
  
  $(collab_tool.dock).append(target);
};

collab_tool.getWhiteboardBounds = function() {
   var offset = $("#whiteboard").offset();
   var scrollLeft = document.body.scrollLeft;
   var scrollTop = document.body.scrollTop;
   var leftMin = offset['left'] - scrollLeft, leftMax = (offset['left']+ $("#whiteboard").outerWidth()) - scrollLeft,
     topMin = offset['top'] - scrollTop, topMax = (offset['top']+ $("#whiteboard").outerHeight()) - scrollTop;
  return {
      "leftMin": leftMin,
      "leftMax": leftMax,
      "topMin": topMin,
      "topMax": topMax
    };
};
collab_tool.coordsInBounds = function(coords) {
   var coordinatesW = collab_tool.getWhiteboardBounds();
   if (coords.x>= coordinatesW['leftMin'] &&
      coords.x <= coordinatesW['leftMax'] &&
      coords.y >= coordinatesW['topMin'] && 
      coords.y <= coordinatesW['topMax']) {
      return true;
    }
    return false;
};




collab_tool.startDraw = function() {
    var whiteboard = $("#whiteboard").get()[0];
    
    whiteboard.addEventListener("mousedown", collab_tool.drawDrag, false);
    whiteboard.addEventListener("mouseup", collab_tool.drawEnd, false);
};

collab_tool.drawDrag = function(evt) {
   var target = document.createElement("div");   
    var offset =$("#dock").offset();
    var top = evt.clientY - offset['top'];
    var left = evt.clientX - offset['left'];

    if ( collab_tool.coordsInBounds({"x": left, y: top } ) ) { 
   $(target).css({"left": evt.clientX - offset['left'], "top": evt.clientY - offset['top']});
  $(target).attr("class", "chalk " + collab_tool.settings.chalkColor ); 
 
    $("#whiteboard").append(target); 
  Oneline.once({ 
        "obj": "generic",
        "data": {
      "type": "draw",
      "data": {
        "time": collab_tool.getSystemClock(),
        "left": left,
        "top": top,
        "chalkColor": collab_tool.settings.chalkColor,
        "user_id": collab_tool.getUserId()
        }
        }
    });
    $("#whiteboard").get()[0].addEventListener("mousemove", collab_tool.drawDrag, false);  
  }
};

collab_tool.drawEnd = function(evt) {
    var whiteboard = $("#whiteboard").get()[0];
    whiteboard.removeEventListener("mousemove", collab_tool.drawDrag, false);
};      


collab_tool.changeSettings = function(nickName, chalkColor) {
  collab_tool.settings['nickName'] = nickName;
  collab_tool.settings['chalkColor'] = chalkColor;
};

collab_tool.initUI = function() {
    //dock
    var dock = document.createElement("div");
    $(dock).attr("id", "dock");
    $(dock).attr("class","dock");
    $(document.body).append(dock);
    var chatAlert  =document.createElement("div");
    
    // plithat
    var outerChatWindow = document.createElement("div");
    var chatWindow = document.createElement("div");
    var chatMembers = document.createElement("div");
     
 
    var chatBox = document.createElement("div");
    var chatBoxTextarea = document.createElement("textarea");
    var chatMessages = document.createElement("div");

     $(chatBoxTextarea).keyup(function(e) {
        if (e.keyCode === 13) { 
        collab_tool.say($(this).val()); 
        $(this).val("");
        }
    });
    $(chatAlert).attr("id", "chatAlert");
    var chatHeading = document.createElement("h2");
    $(chatHeading).text("Chat Window");
    // dock for whiteboard
    var outerWhiteboard = document.createElement("div");
    var whiteboard = document.createElement("div");
    $(whiteboard).attr("id", "whiteboard");
    $(whiteboard).attr("class", "whiteboard");
     
    $(chatWindow).attr("class", "chat-window");
    $(chatMembers).attr("id", "members");
    $(chatMembers).attr("class", "members");
    $(chatMessages).attr("id", "chatMessages");
     
    
    var scrollWidth  = collab_tool.getScrollWidth(); 
    $(outerChatWindow).css({"width": "30%"});
    $(outerWhiteboard).css({"width": "70%"});
    $(whiteboard).height(window.innerHeight);
    $(chatWindow).height(window.innerHeight);

    $(chatBox).attr("id","chatBox");
    $(chatBox).attr("class", "chat-box");
    var chatMessagesHeading = document.createElement("h2");
    $(chatMessagesHeading).text("Messages");
    var chatMessagesClr = document.createElement("div");
    $(chatMessagesClr).attr("class", "clear");
    var chatMessagesHr = document.createElement("hr");
    $(chatMessagesHr).attr("class", "hr");
    var chatMessagesClr2 = document.createElement("div");
    $(chatMessagesClr2).attr("class", "clear");
    $(chatMessages).attr("class", "chat-messages");
    $(chatMessages).append(chatMessagesHeading);
    $(chatMessages).append(chatMessagesClr);
    $(chatMessages).append(chatMessagesHr);
    $(chatMessages).append(chatMessagesClr2);
    $(chatWindow).append(chatHeading);
    $(chatWindow).append(chatMembers);
    var chatWindowClr1 = document.createElement("div");
    $(chatWindowClr1).attr("class", "clear");
    $(chatWindow).append(chatWindowClr1);
    $(chatWindow).append(chatMessages);
    var chatWindowClr2 = document.createElement("div");
    $(chatWindowClr2).attr("class","clear");
    $(chatWindow).append(chatWindowClr2);
    $(chatWindow).append(chatBox);
    
    var reltrace = document.createElement("div");
    $(reltrace).css({"width": "inherit", "height": "inherit", "position": "relative"});
    $(reltrace).attr("class", "reltrace");
    var button = document.createElement("button");

    $(button).attr("class", "dc_g_button blue say-button");
    $(button).css({"position": "absolute","bottom": "5px"});
    
    $(button).html("Say");
    $(button).click(function(e) {
        collab_tool.say($("#chatBox").val());
    });
    //make alert in the middle
    $(chatAlert).css({"left": ((window.innerWidth  / 2)  - ($(chatAlert).outerWidth()  /2))  + "px" });
    $(chatBox).append(chatBoxTextarea);
    $(chatBox).append(button);
      
    $(outerChatWindow).append(chatWindow);
    $(outerWhiteboard).append(whiteboard);
    $(dock).append(chatAlert);
    $(dock).append(outerWhiteboard);
    $(dock).append(outerChatWindow);

    collab_tool.startDraw();
};


collab_tool.say = function(message) {
   Oneline.once({ "obj": "generic",
        "data": {
        "once": true, 
        "type": "chat",
        "data": {
          "time": collab_tool.getSystemClock(),
          "message": message,
          "user_id":  collab_tool.getUserId()
          }
      }
  });
 
};

window.onunload  = function() {
    if (collab_tool.userReady) {
    Oneline.once({
          "obj": "generic", 
          "data": {
            "type": "leaveMember",
            "data": {
                "user_id": collab_tool.getUserId()
              }
      }
    });
    }
};
    
/*
window.onload = function() {
  // webfont 
  WebFont.load({ google:{
         families: ["Raleway:100,200,300,regular,500,600,700,800"] 
      }
    });
  collab_tool.setup();
};
*/

collab_tool.warn = function(msg) {
   $("#chatAlert").text(msg);
   $("#chatAlert").show(); 
   setTimeout(function() {
      $("#chatAlert").hide();
   }, 1000);

};
collab_tool.getScrollWidth = function() {
   var currentWidth = window.innerWidth;
   var dummyElement =  document.createElement("div");
   document.body.appendChild(dummyElement);
   dummyElement.style.height = window.innerHeight + 1;
   var scrollWidth  = window.innerWidth  -currentWidth; 
   dummyElement.remove();
   return scrollWidth;
};
