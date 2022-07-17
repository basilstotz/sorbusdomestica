# set this to the ods-file name (without .ods). This example is for "projekt.ods"
file:=projekt

#set to max allowed dinstance in [m]
max_dist:=20.0




#do not touch below this
datasette:=openstreetmap/datasette

check: $(file).json ./$(datasette)/sorbusdomestica.sqlite
	@echo make check $(file).ods
	@cat $(file).json | node ./bin/check-and-add-osmid.js $(max_dist) > /dev/null

draft: $(file)-draft.ods 

osm:
	@echo update data from osm
	@rm ./openstreetmap/cache/sorbus+045+005.json
	@./openstreetmap/bin/query-all-sorbus.sh
	@cat ./openstreetmap/sorbusdomestica.geojson | node ./$(datasette)/bin/prepare-datasette.js > ./$(datasette)/sorbusdomestica.json.tmp
	@mv ./$(datasette)/sorbusdomestica.json.tmp ./$(datasette)/sorbusdomestica.json
	@sqlite-utils insert ./$(datasette)/sorbusdomestica.sqlite trees ./$(datasette)/sorbusdomestica.json --pk=id --alter  --truncate


# helper
$(file).json: $(file).ods
	@echo make $(file).json
	@soffice --convert-to csv $(file).ods --headless
#	csv2json $(file).csv | jq . | sed -e 's/\\n/ /g' | jq . > $(file).json
	@sqlite-utils memory $(file).csv "select * from $(file)" | jq . | sed -e 's/\\n/ /g' | jq . | > $(file).json.tmp
	@mv $(file).json.tmp $(file).json
	@rm $(file).csv

$(file)-draft.json: $(file).json  ./$(datasette)/sorbusdomestica.sqlite
	@echo make $(file)-draft.json
	@cat $(file).json | node ./bin/check-and-add-osmid.js $(max_dist) > $(file)-draft.json.tmp
	@mv $(file)-draft.json.tmp $(file)-draft.json

$(file)-draft.ods: $(file)-draft.json
	@echo make $(file)-draft.ods
	@cat $(file)-draft.json | sqlite-utils memory - "select  * from stdin" --csv > $(file)-draft.csv.tmp
	@mv $(file)-draft.csv.tmp $(file)-draft.csv
	@soffice --convert-to ods $(file)-draft.csv --headless
#	@rm $(file)-draft.csv


