#!/bin/sh

CACHE_DIR="./cache"
mkdir -p $CACHE_DIR

query_part(){
    LAT1=$1
    LON1=$2
    LAT2=$(echo "$LAT1 + 5"|bc)
    LON2=$(echo "$LON1 + 5"|bc) 

    QUERY="[timeout:900];node($LAT1,$LON1,$LAT2,$LON2)"'["natural"="tree"]["species"~".*[Ss]orbus.*[Dd]omestica.*"];out meta;'

    FA=$(printf "%+04i" $LAT1)
    FO=$(printf "%+04i" $LON1)
    FILE="$CACHE_DIR/sorbus$FA$FO.json"

    if ! test -f $FILE; then
	echo $FILE
	echo $QUERY | query-overpass | tee $FILE.tmp
	mv $FILE.tmp $FILE
    fi
}


LAT=30
LON=-10

for O in $(seq 0 8); do
    for A in $(seq 0 4); do
	LA=$(( LAT + 5 * A ))
	LO=$(( LON + 5 * O ))
	query_part $LA $LO
    done
done

geojson-merge $CACHE_DIR/sorbus*.json | node ./bin/update-meta.js > sorbusdomestica.geojson


cat sorbusdomestica.geojson | node ./bin/prepare-datasette.js > sorbusdomestica.json

#test -f sorbusdomestica.sqlite && rm sorbusdomestica.sqlite
sqlite-utils insert sorbusdomestica.sqlite trees sorbusdomestica.json --pk=id --alter  --truncate

sqlite-utils  rows --csv sorbusdomestica.sqlite trees > sorbusdomestica.csv



exit 0
