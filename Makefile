# development settings
PROJECT_NAME=certcache


build_poetry:
	docker build -t ${PROJECT_NAME}poetry ./dev/dockerfiles/poetry

run_poetry: build_poetry
	docker run \
		-v "`pwd`/docker:/docker" \
		--rm -it ${PROJECT_NAME}poetry