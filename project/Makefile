projekt=projekt
dist:=1

# json to ods
$(projekt)-neu.ods: tmp/$(projekt)-neu.json
	cat ./tmp/$(projekt)-neu.json | sqlite-utils memory - "select  * from stdin" --csv > $(projekt)-neu.csv.tmp
	mv $(projekt)-neu.csv.tmp ./tmp/$(projekt)-neu.csv
	soffice --convert-to ods ./tmp/$(projekt)-neu.csv --headless
#	rm $(file)-draft.csv

.PHONY: check
check: tmp/$(projekt).json tmp/triage.sqlite
	cat ./tmp/$(projekt).json | ./bin/check-and-add-osmid.js $(dist) > /dev/null

# check and add
tmp/$(projekt)-neu.json: tmp/$(projekt).json tmp/triage.sqlite
	cat ./tmp/$(projekt).json | ./bin/check-and-add-osmid.js $(dist) > ./tmp/$(projekt)-neu.json 



# ods to json
tmp/$(projekt).json: $(projekt).ods
	soffice --headless --convert-to csv $(projekt).ods 
	csv2json    ./$(projekt).csv | sed -e 's/\\n/ /g'| jq . > ./tmp/$(projekt).json
	rm ./$(projekt).csv
#	sqlite-utils memory $(projekt).csv "select * from $(projekt)" | jq . | sed -e 's/\\n/ /g'| jq .  > $(projekt).json.tmp
#	mv $(projekt).json.tmp ./tmp/$(projekt).json




tmp/triage.sqlite: tmp/sorbusdomestica.geojson
	cat ./tmp/sorbusdomestica.geojson | ./bin/triage.js | sqlite-utils insert --truncate ./tmp/triage.sqlite trees -

tmp/sorbusdomestica.geojson:
	wget -O ./tmp/sorbusdomestica.geojson "https://speierling.arglos.ch/gis/site/sorbusdomestica.geojson"

