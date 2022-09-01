#!/usr/bin/env node

//const fs = require('fs');
//const { execSync } = require('child_process');
//const crypto = require('crypto')


/*
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/

// geo.admin api
// https://www.swisstopo.admin.ch/en/maps-data-online/calculation-services/m2m.html#dokumente_und_publik
//
// api example: http://geodesy.geo.admin.ch/reframe/wgs84tolv03?easting=7.43863&northing=46.95108&altitude=550.0&format=json


function triage(geodata){

    var project=JSON.parse(geodata);

    var out=[];
    
    for (let i=0;i<project.features.length;i++){
	
	let item=project.features[i];

        //console.log(JSON.stringify(item,null,2));

	let line={};
	line['id']=item.properties.id;
	line['latitude']=item.geometry.coordinates[0];
	line['longitude']=item.geometry.coordinates[1];
	out[i]=line;
	
    }    
    process.stdout.write(JSON.stringify(out,null,2)+'\n');
}


var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    triage(chunks)
});


