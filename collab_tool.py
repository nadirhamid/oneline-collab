
from oneline import ol
import cherrypy
import time
class collab_tool(ol.module):
  def start(self):
    self.pipeline = ol.stream()
  def receiver(self,message):
    data = message.get("generic")
    db = ol.db(self.pipeline)
    response =  ol.response()
    if data:
       
      #cherrypy.log("received request of:")
      #cherrypy.log(data.__str__())
   
      if data: 
        if data['type']  == "draw":
          self.insert("collab_tool_drawings",
             user_id=data['data']['user_id'],
             topCoords=data['data']['top'],
             leftCoords=data['data']['left'], 
             chalkColor=data['data']['chalkColor'],
              time=str(data['data']['time'])
            )
        elif data['type']  == "leaveMember":
          theUser = self.query(db.collab_tool_users.id ==  data['data']['user_id']).first()
          if theUser:
            self.query(db.collab_tool_users.id  == data['data']['user_id']).first().update(status=0)
          
        
        #elif data['type'] == "welcome":      
        elif data['type']  == "newMember":
          userRequested = data['data']['user']
          currentMember = self.query(db.collab_tool_users.nickName == userRequested['nickName']).first()
          if currentMember: 
            response.set("error", True)
            response.set("message","Someone has taken this username")
          else:
            newMember = self.insert("collab_tool_users",
                nickName=userRequested['nickName'],
                joined=str(time.time()),
                status=1
              )
             
            response.set("error",False)
            response.set("user", newMember.as_dict())
            response.set("time", time.time())
            response.set("message", "You have joined the collab tool successfully")

                  
          
        elif data['type'] ==  "chat":
          self.insert("collab_tool_messages",
            user_id=data['data']['user_id'],
            message=data['data']['message'],
            time=str(data['data']['time'])
            #status=time.time()
          )
        elif data['type'] == "sync":
          if 'lastUpdate' in data['data'].keys():
            lastUpdateTime = float(data['data']['lastUpdate'])  - 10
            ## Experiemental COMET style websocket. Does not currently work :(
            # uncomment if your wild
            #users = self.count((db.collab_tool_users.joined >  lastUpdateTime) & (db.collab_tool_users.status == "1"))
            #messages = self.count(db.collab_tool_messages.time > lastUpdateTime)
            #drawings = self.count(db.collab_tool_drawings.time > lastUpdateTime)
            #while  users == 0 and messages == 0 and drawings == 0:
            #  users = self.count((db.collab_tool_users.joined > lastUpdateTime) & (db.collab_tool_users.status == "1"))
            #  drawings = self.count(db.collab_tool_drawings.time > lastUpdateTime)
            #  messages = self.count(db.collab_tool_messages.time > lastUpdateTime)

            users = self.query((db.collab_tool_users.joined > lastUpdateTime) & ( db.collab_tool_users.status == "1"))
            messages = self.query(db.collab_tool_messages.time > lastUpdateTime, join=db.collab_tool_users.on(db.collab_tool_users.id == db.collab_tool_messages.user_id))  
            drawings = self.query(db.collab_tool_drawings.time  > lastUpdateTime)
          else:
            users = self.query(db.collab_tool_users.status == "1")
            messages = self.query(db.collab_tool_messages, join=db.collab_tool_users.on(db.collab_tool_users.id==db.collab_tool_messages.user_id))
            drawings = self.query(db.collab_tool_drawings)

          response.set("users",users.as_list())
          response.set("messages", messages.as_list())
          response.set("drawings",drawings.as_list())
          response.set("type", data['type'])
      #if data['type'] == "newMember":
      #  cherrypy.log(response.as_dict().__str__())
      #cherrypy.
      response.set("type",data['type'])
      message.set("response", response)
   
    self.pipeline.run(message)
    
      
      
       
    
      
      
    



