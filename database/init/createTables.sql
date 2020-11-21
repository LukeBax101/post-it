

CREATE TABLE games (game_id UUID PRIMARY KEY, game_code VARCHAR(255), state INT, created_at TIMESTAMP, disable_questions BOOLEAN);

CREATE TABLE players (player_id UUID PRIMARY KEY, secret_id UUID, game_id UUID REFERENCES games(game_id), name VARCHAR(255), post_it_name VARCHAR(255), giver_player_id UUID REFERENCES players(player_id), completed_at TIMESTAMP, joined_at TIMESTAMP);

CREATE TABLE questions (question_id UUID PRIMARY KEY, player_id UUID REFERENCES players(player_id), question VARCHAR(255), answer BOOLEAN, notes VARCHAR(255), created_at TIMESTAMP);

ALTER TABLE games ADD COLUMN creator_player_id UUID REFERENCES players(player_id);
