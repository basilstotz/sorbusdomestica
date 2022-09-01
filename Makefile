
all: sorbusdomestica.sqlite


sorbusdomestica.json: ./openstreetmap/datasette/sorbusdomestica.json ./project/projekt-draft.json
	@echo make sorbusdomestica.json
	@sqlite-utils memory ./openstreetmap/datasette/sorbusdomestica.json ./project/projekt-draft.json \
            "select t1.*, t2.Aufnahmedatum, t2.Erwaehnung, t2.Fruechte, t2.Bemerkung, t2.autochton, t2.natural from t1 left join t2 on t1.id = t2.osmid" | \
            jq . > sorbusdomestica.json.tmp
	@mv sorbusdomestica.json.tmp sorbusdomestica.json

sorbusdomestica.sqlite: sorbusdomestica.json
	@echo make sorbusdomestica.sqlite
	@test -f ./sorbusdomestica.sqlite && rm ./sorbusdomestica.sqlite
	@sqlite-utils insert ./sorbusdomestica.sqlite trees ./sorbusdomestica.json  --pk=id  

project/projekt-draft.json: project/projekt.ods
	$(MAKE) -C project draft

