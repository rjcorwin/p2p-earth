docker build -t rjsteinert/p2p-web:local .
./start.sh
docker logs -f p2p-earth
