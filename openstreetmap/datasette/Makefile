
start:  daten
	@./bin/install-datasette.sh
	@datasette serve sorbusdomestica.sqlite &

stop:
	@pkill datasette

daten: sorbusdomestica.sqlite

sorbusdomestica.sqlite: ../sorbusdomestica.geojson ./bin/prepare-datasette.js
	@echo "update datenfiles"
	@cat ../sorbusdomestica.geojson | node ./bin/prepare-datasette.js > ./sorbusdomestica.json
	@sqlite-utils insert ./sorbusdomestica.sqlite trees ./sorbusdomestica.json --pk=id --alter  --truncate
	@sqlite-utils  rows --csv ./sorbusdomestica.sqlite trees > ./sorbusdomestica.csv

