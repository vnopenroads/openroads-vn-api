db:
	docker build -t "openroads-db:base" .

test-db: db
	docker build -t "openroads-db:test" extensions/test