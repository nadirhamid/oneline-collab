DROP TABLE IF EXISTS `collab_tool_drawings`;
DROP TABLE IF EXISTS `collab_tool_users`;
DROP TABLE IF EXISTS `collab_tool_messages`;


CREATE TABLE IF NOT EXISTS `collab_tool_drawings` (
  `id`  smallint(3) AUTO_INCREMENT,
   `topCoords` VARCHAR(255),
   `leftCoords` VARCHAR(255),
   `user_id` VARCHAR(255),
   `chalkColor` varchar(255),
    `time` VARCHAR(255),
   PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS `collab_tool_users` (
  `id` smallint(3) AUTO_INCREMENT,
  `nickName` varchar(255),
   `status` smallint(3),
  `joined` varchar(255),
  PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS `collab_tool_messages` (
  `id` smallint(3) AUTO_INCREMENT,
  `user_id` smallint(3),
  `message` varchar(255),
    `time`  varchar(255),
  PRIMARY KEY(id)
);

INSERT INTO `collab_tool_users` (`id`, `nickName`, `status`)  VALUES (NULL,  'Nadir.Hamid', 1);
 

