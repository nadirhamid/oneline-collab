from oneline import ol

def collab_tool_init():
  print "Starting server and constructing the SQL"
  return ol.controller_init(sql='collab_tool.sql', startserver=True)


def collab_tool_stop():
  print "Stopping the oneline server"
  return ol.controller_stop(stopserver=True)

def collab_tool_clean():
  print "Cleaning your application"
  return ol.controller_clean(cleansql=True)

def collab_tool_restart():
  print "Restarting server"
  return ol.controller_restart()
