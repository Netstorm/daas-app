CREATE TABLE `mhsvdi`.`users` ( 
  `username` VARCHAR(40) NOT NULL ,
  `name` VARCHAR(40) NOT NULL ,
  `instanceId` VARCHAR(40) NULL DEFAULT NULL ,
  `instanceStatus` VARCHAR(40) NULL DEFAULT NULL ,
  `instanceIP` VARCHAR(16) NULL DEFAULT NULL ,
  `ipAllocationId` VARCHAR(40) NULL DEFAULT NULL ,
  PRIMARY KEY (`username`(40))) ENGINE = InnoDB;