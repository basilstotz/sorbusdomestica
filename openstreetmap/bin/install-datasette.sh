#!/bin/sh

if test -z "$(which datasette)"; then
     #some tools
     pip install sqlite-utils
     pip install geojson-to-sqlite


     #datasette
     pip install datasette
     #pip install datasette-render-images
     datasette install datasette-geojson-map
     datasette install datasette-cluster-map
     datasette install datasette-leaflet-geojson

fi
   
