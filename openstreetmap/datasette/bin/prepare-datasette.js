#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

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

function addMeta(geodata){

    var geo=JSON.parse(geodata);

    var out=[];
    
    for (let i=0;i<geo.features.length;i++){
	
	let item=geo.features[i];
	
	//address
	let address = item.properties.nominatim.address;
	let country;
	let state;
	let county;
	if(address.country)country=address.country;
	if(address.state)state=address.state;
	if(address.county)county=address.county;

	if(!state){
	    if(address.city){
		state=address.city;
	    }else{
		if(address.region){
		    state=address.region;
                }else{
		    state='unknown';
		}
	    }
	}

	if(!county){
	    if(address.state_district){
		county=address.state_district;
	    }else{
		if(address.city){
		    county=address.city;
		}else{
		    if(state!=''){
			county=state;
		    }else{
			county='unknown';
		    }
		}
	    }
	}

	let longitude=item.geometry.coordinates[0];
        let latitude=item.geometry.coordinates[1];
	let user;
	if(item.properties.meta.user){
	    user=item.properties.meta.user;
	}else{
	    user='unknown';
	}
        out[i] = {
	    id: item.properties.id,
	    user: user,
	    country: country,
	    state: state,
	    county: county,
	    longitude: longitude,
	    latitude: latitude,
	    elevation: item.geometry.coordinates[2]
	};

	//tags
	let tags = item.properties.tags;
        let tag_array=[ 'circumference',
			'height',
			'diameter_crown',
			'denotation',
			'start_date',
			'note'
		      ];
	for(let j=0;j<tag_array.length;j++){
	    let tag=tag_array[j];
	    if(tags[tag])out[i][tag]=tags[tag];
	}

        //link
	let url='https://www.openstreetmap.org/?mlat='+latitude+'&mlon='+longitude+'#map=17/'+latitude+'/'+longitude;
//	out[i]['osm']={ href: url, label: 'Open on Openstreetmap' };
	out[i]['osm']=url;
	
	//geometry
	out[i]['geometry']=item.geometry;
	//out[i]['address']=address;
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
    addMeta(chunks)
});


