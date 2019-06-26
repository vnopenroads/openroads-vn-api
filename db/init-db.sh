echo "******PostgreSQL initialisation******"

for f in /docker-entrypoint-initdb.d/sql/*.sql; do
    echo "Executing $f"
    "${psql[@]}" --dbname="$DB" -a -f $f<<-'EOSQL'
    
EOSQL
done

echo "******Initialisation finished******"