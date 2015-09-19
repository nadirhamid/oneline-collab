
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
       
      cherrypy.log("received request of:")
      cherrypy.log(data.__str__())
   
      if data: 
        if data['type']  == "draw":
          self.insert("collab_tool_drawings",
             user_id=data['data']['user_id'],
             topCoords=data['data']['top'],
             leftCoords=data['data']['left'], 
             chalkColor=data['data']['chalkColor'],
              time=time.time() 
            )
        elif data['type']  == "leaveMember":
          theUser = self.query(db.collab_tool_users.id ==  data['data']['user_id']).first()
          if theUser:
            self.query(db.collab_tool_users.id  == data['data']['user_id']).update(status=0)
          
        
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
                joined=time.time(),
                status=1
              )
             
            response.set("error",False)
            response.set("user", newMember.as_dict())
            response.set("message", "You have joined the collab tool successfully")

                  
          
        elif data['type'] ==  "chat":
          self.insert("collab_tool_messages",
            user_id=data['data']['user_id'],
            message=data['data']['message'],
            time=time.time(),
            #status=time.time()
          )
        elif data['type'] == "sync":
          if 'lastUpdate' in data['data'].keys():
            lastUpdateTime = float(data['data']['lastUpdate'])
            users = self.query((db.collab_tool_users.joined >  lastUpdateTime) & (db.collab_tool_users.status == 1)).count()
            messages = self.query(db.collab_tool_messages.time > lastUpdateTime).count()
            drawings = self.query(db.collab_tool_drawings.time > lastUpdateTime).count()
            while  users == 0 and messages == 0 and drawings == 0:
              time.sleep(1)
              return self.receiver(message)
            users = self.query((db.collab_tool_users.joined > lastUpdateTime) & ( db.collab_tool_users.status == 1))
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
          cherrypy.log(response.as_dict().__str__())     
      #if data['type'] == "newMember":
      #  cherrypy.log(response.as_dict().__str__())
      #cherrypy.
      cherrypy.log("Sending back:")
      cherrypy.log(message.as_dict().__str__())
      response.set("type",data['type'])
      message.set("response", response)
      cherrypy.log(response.as_dict().__str__())
   
    self.pipeline.run(message)
    
      
      
       
    
      
      
    



