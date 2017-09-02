
CREATE TABLE states (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	name varchar(40) NOT NULL UNIQUE
);


CREATE TABLE localities (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	name varchar(40) NOT NULL UNIQUE,
	pinCode INT UNSIGNED NOT NULL,
	state_id INT UNSIGNED NOT NULL,

	FOREIGN KEY fk_state_id(state_id)
	REFERENCES states(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);


CREATE TABLE users (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	fullName varchar(40) NOT NULL,
	dob DATETIME,
	gender CHAR(1),
	email varchar(150) UNIQUE,
	phone BIGINT UNSIGNED NOT NULL UNIQUE,
	pinCode INT UNSIGNED,
	locality_id_F_I INT UNSIGNED,		#locality id for the financial inclusions to see
	state_id_O_Polls INT UNSIGNED,		#State id opted for the opinion polls
	attempts_left_state_change_OP TINYINT UNSIGNED NOT NULL DEFAULT 2,		#number of attempts left to change state for opinion polls (2 times in 2 months)
	last_OP_date DATETIME NOT NULL DEFAULT 2017-08-28 00:00:00,			#last date of submitting an opinion poll

	FOREIGN KEY fk_locality_id_F_I(locality_id_F_I)
	REFERENCES locality(id)
	ON UPDATE CASCADE
	ON DELETE SET NULL,

	FOREIGN KEY fk_state_id_O_Polls(state_id_O_Polls)
	REFERENCES states(id)
	ON UPDATE CASCADE
	ON DELETE SET NULL
);

CREATE TABLE users_opted_states_for_bills (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	state_central_id INT UNSIGNED NOT NULL,
	user_id INT UNSIGNED NOT NULL,

	FOREIGN KEY fk_state_id(state_central_id)
	REFERENCES states(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE,

	FOREIGN KEY fk_user_id(user_id)
	REFERENCES users(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);


CREATE TABLE bills_ordinances (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	name varchar(150) NOT NULL UNIQUE,
	date DATETIME NOT NULL,
	type TINYINT UNSIGNED NOT NULL,
	state_central_id INT UNSIGNED NOT NULL,
	synopsis TEXT NOT NULL,
	actual_bill_link varchar(150) NOT NULL,
	pros TEXT NOT NULL,
	cons TEXT NOT NULL,
	newspaper_articles_links TEXT NOT NULL,
	
	FOREIGN KEY fk_state_central_id(state_central_id)
	REFERENCES states(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);

CREATE TABLE opinion_polls (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	question varchar(120) NOT NULL,
	state_central_id INT UNSIGNED NOT NULL,
	date_start DATETIME NOT NULL,
	date_end DATETIME NOT NULL,

	FOREIGN KEY fk_state_central_id(state_central_id)
	REFERENCES states(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);

CREATE TABLE bills_ordinances_votes (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	user_id INT UNSIGNED NOT NULL,
	bill_ordinance_id INT UNSIGNED NOT NULL,
	vote TINYINT UNSIGNED NOT NULL,
	date_of_submission DATETIME NOT NULL,
		
	FOREIGN KEY fk_user_id(user_id)
	REFERENCES users(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE,

	FOREIGN KEY fk_bill_oridinance_id(bill_ordinance_id)
	REFERENCES bills_ordinances(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);

CREATE TABLE temp_users (
	id INT UNSIGNED auto_increment primary key NOT NULL,
	phone BIGINT UNSIGNED NOT NULL UNIQUE,
	user_id INT UNSIGNED,
	otp INT UNSIGNED NOT NULL,
	timeout_id INT UNSIGNED,

	FOREIGN KEY fk_user_id(user_id)
	REFERENCES users(id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);