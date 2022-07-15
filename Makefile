file:=projekt


draft: $(file)-draft.ods 


final: $(file)-final.ods


$(file).json: $(file).ods
	@echo make $(file).json
	@soffice --convert-to csv $(file).ods --headless
#	csv2json $(file).csv | jq . | sed -e 's/\\n/ /g' | jq . > $(file).json
	@sqlite-utils memory $(file).csv "select * from $(file) where 'Gemeinde' != ''" | jq . > $(file).json
	@rm $(file).csv

$(file)-draft.json: $(file).json ./openstreetmap/datasette/sorbusdomestica.json
	@echo make $(file)-draft.json
	@sqlite-utils memory $(file).json ./openstreetmap/datasette/sorbusdomestica.json \
          "select t1.* , t2.* from t1 left join t2 on (abs(t2.longitude - t1.Laengengrad) < 0.00001) and (abs(t2.latitude - t1.Breitengrad) < 0.00001)" | jq . > $(file)-draft.json

$(file)-draft.ods: $(file)-draft.json
	@echo make $(file)-draft.ods
	@cat $(file)-draft.json | sqlite-utils memory - "select * from stdin" --csv > $(file)-draft.csv
	@soffice --convert-to ods $(file)-draft.csv --headless
	@rm $(file)-draft.csv

$(file)-final.json: $(file)-draft.json
	@echo make $(file)-final.json
	@cat $(file)-draft.json | \
	sqlite-utils memory - \
	"select   id, state, Gemeinde, Gebiet, Natuerlich, latitude, longitude, Beugihalde, CHY, BHU, BHD, Aufnahmedatum, Erwaehnung, Fruechte, fehlendend, Bemerkung from stdin" | jq .  > $(file)-final.json

$(file)-final.ods: $(file)-final.json
	@echo make $(file)-final.ods
	@cat $(file)-final.json | sqlite-utils memory - "select * from stdin" --csv > $(file)-final.csv
	@soffice --convert-to ods $(file)-final.csv --headless
	@rm $(file)-final.csv

osm:
	@echo update data from osm
	@rm ./openstreetmap/cache/sorbus+045+005.json
	@./openstreetmap/bin/query-all-sorbus.sh
	@cat ./openstreetmap/sorbusdomestica.geojson | node ./openstreetmap/bin/prepare-datasette.js > ./openstreetmap/datasette/sorbusdomestica.json
