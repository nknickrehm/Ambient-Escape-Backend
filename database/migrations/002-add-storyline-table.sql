CREATE TABLE Storyline
(
  StorylineID SERIAL,
  GameID int NOT NULL REFERENCES Game (GameID) ON DELETE CASCADE,
  Storyline int,
  PRIMARY KEY 
  (StorylineID)
);