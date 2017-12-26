#!/usr/bin/env bash

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

echo "Pulling $TAG"
docker pull rjsteinert/p2p-web:$TAG
docker kill $CONTAINER_NAME > /dev/null
docker rm $CONTAINER_NAME > /dev/null
echo "Running $T_CONTAINER_NAME at version $T_TAG"
docker run -d \
  --name $CONTAINER_NAME \
  -e "BASE_PATH=$BASE_PATH" \
  -e "SESSION_SECRET=$SESSION_SECRET" \
  -e "LETSENCRYPT_HOST=$DOMAIN" \
  -e "VIRTUAL_HOST=$DOMAIN" \
  -e "LETSENCRYPT_EMAIL=$EMAIL" \
  -e "AUTH0_DOMAIN=$AUTH0_DOMAIN" \
  -e "AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID" \
  -e "AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET" \
  --volume $(pwd)/db:/app/db/ \
  rjsteinert/p2p-web:$TAG
