CREATE TABLE IF NOT EXISTS web_apps (
	app_name VARCHAR PRIMARY KEY,
	web_name VARCHAR,
	url VARCHAR NOT NULL,
	icon LONGVARCHAR DEFAULT NULL,
	regex_0 VARCHAR DEFAULT app_name,
	regex_1 VARCHAR DEFAULT NULL
);

INSERT INTO web_apps VALUES ( "githubSearch", "Github", "https://www.github.com/search?q=", "../icons/github.png", "/github/i", NULL);
INSERT INTO web_apps VALUES ( "bitbucketSearch", "BitBucket", "https://www.bitbucket.com/search?q=", "../icons/bitbucket.png", "/bitbucket/i", NULL);
INSERT INTO web_apps VALUES ( "wikiSearch", "Wikipedia", "https://en.wikipedia.org/w/index.php?search=", "../icons/wikipedia.png", "/wikipedia/i", NULL);
INSERT INTO web_apps VALUES ( "youtubeSearch", "YouTube", "https://www.youtube.com/results?search_query=", "../icons/youtube.png", "/youtube/i", NULL);
