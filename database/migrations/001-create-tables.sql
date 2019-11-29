CREATE TABLE Game
(
  GameID SERIAL,
  Status Varchar (255) NOT NULL,
  BeginTime TIMESTAMP,
  EndTime TIMESTAMP,
  PRIMARY KEY 
  (GameID)
);

CREATE TABLE Player
(
  PlayerID SERIAL,
  GameID int NOT NULL REFERENCES Game (GameID) ON DELETE CASCADE,
  Name Varchar (255) NOT NULL,
  Mail Varchar (255) NOT NULL,
  Status Varchar (255) NOT NULL,
  PRIMARY KEY 
  (PlayerID)
);

CREATE TABLE Riddle
(
  RiddleID SERIAL,
  GameID int NOT NULL REFERENCES Game (GameID) ON DELETE CASCADE,
  Progress int NOT NULL,
  Description Varchar (255) NOT NULL,
  Status Varchar (255) NOT NULL,
  PRIMARY KEY
  (RiddleID)
);

CREATE TABLE Code
(
  CodeID SERIAL,
  SenderRiddleID int NOT NULL REFERENCES Riddle (RiddleID) ON DELETE CASCADE,
  ReceiverRiddleID int NOT NULL REFERENCES Riddle (RiddleID) ON DELETE CASCADE,
  key Varchar (255) NOT NULL,
  value Varchar (255) NOT NULL,
  status Varchar (255) NOT NULL,
  PRIMARY KEY 
  (CodeID)
);

CREATE TABLE RiddleEvent
(
  RiddleEventID SERIAL,
  RiddleID int NOT NULL REFERENCES Riddle (RiddleID) ON DELETE CASCADE,
  Type Varchar (255) NOT NULL,
  Timestamp TIMESTAMP,
  Data TEXT,
  PRIMARY KEY
  (RiddleEventID)
);

CREATE TABLE Activity
(
  ActivityID SERIAL,
  GameID int NOT NULL REFERENCES Game (GameID) ON DELETE CASCADE,
  Temperature FLOAT,
  Humidity FLOAT,
  PRIMARY KEY
  (ActivityID)
)