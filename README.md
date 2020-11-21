# Post-it 
The classic post-it game online.


Secrets:



 - Add a secret password file to the secrets folder, this will be the password for the database


Docker commands:

 - To start postgres database container:

```
./startdb.sh
```

 - To manage from inside container:

```
docker exec -it pi-postgres bash
psql -U postgres
```

 - To manage from host machine:

```
psql -h localhost -p 5430 -U postgres -W
```

- To shutdown database container

```
docker stop pi-postgres
docker rm pi-postgres
```
