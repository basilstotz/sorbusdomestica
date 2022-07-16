#!/bin/sh


DEST="./datasette"
cat sorbusdomestica.geojson | node ./bin/prepare-datasette.js > $DEST/sorbusdomestica.json

#test -f sorbusdomestica.sqlite && rm sorbusdomestica.sqlite
sqlite-utils insert $DEST/sorbusdomestica.sqlite trees $DEST/sorbusdomestica.json --pk=id --alter  --truncate

sqlite-utils  rows --csv $DEST/sorbusdomestica.sqlite trees > $DEST/sorbusdomestica.csv

exit 0
