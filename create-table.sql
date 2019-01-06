CREATE TABLE process.env.DB_DBNAME.`users` ( 
  `username` VARCHAR(40) NOT NULL ,
  `name` VARCHAR(40) NOT NULL ,
  `instanceId` VARCHAR(40) NULL DEFAULT NULL ,
  `instanceStatus` VARCHAR(40) NULL DEFAULT NULL ,
  `instanceIP` VARCHAR(16) NULL DEFAULT NULL ,
  `ipAllocationId` VARCHAR(40) NULL DEFAULT NULL ,
  `lastStartTime` VARCHAR(50) NULL DEFAULT NULL ,
  `lastStopTime` VARCHAR(50) NULL DEFAULT NULL ,
  `usageInSeconds` BIGINT(20) NULL DEFAULT 0 ,
  PRIMARY KEY (`username`(40))) ENGINE = InnoDB;