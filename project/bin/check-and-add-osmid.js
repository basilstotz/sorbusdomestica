#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto')


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

var maxDist;

if(process.argv[2]){
    maxDist=process.argv[2];
    if(maxDist<1.0)maxDist=1.0;
}else{
    maxDist=1.0;
}

process.stderr.write('\nmax_dist='+maxDist+'m\t(ändern mit \"gedit Makefile\")\n\n');

function addMeta(geodata){

    var project=JSON.parse(geodata);

  
    var cache;
    var path='./cache/id-cache.json';
    if (fs.existsSync(path)) {
	cache=JSON.parse(fs.readFileSync(path));
    } else {
	cache={}
    }

    
    
    for (let i=0;i<project.length;i++){
	
	let item=project[i];
	
        let laenge=item.Laengengrad;
	let breite=item.Breitengrad;

	let Gemeinde=item.Gemeinde;
	let Gebiet=item.Gebiet;
        let fehlend=item.fehlendend;	
        let Natuerlich=item.Natuerlich;

	let p=Gemeinde+'/'+Gebiet+' ';
	let place=p.padEnd(61,'.');

	let hash = crypto.createHash('md5').update(Gemeinde+Gebiet).digest("hex");
	
	let query="select id, latitude, longitude, (longitude - :lon)*(longitude - :lon)+(latitude - :lat)*(latitude - :lat) as dist from trees where dist != 'null' and dist >= 0.0  order by dist limit 1"
	
        let cmd='sqlite-utils query ./../openstreetmap/datasette/sorbusdomestica.sqlite \"'+query+'\" -p lon '+laenge+' -p lat '+breite;

	let dist;
	
	let ans=[ { id: "", latitude: -999.9, longitude: -999.9, dist: 999.9 } ];
	//console.log( laenge+' '+breite+' '+Gemeinde+' '+Gebiet)
	//console.log(cmd);
	if((breite!='')&&(laenge!='')&&(Gemeinde!='')){
	    if((breite.indexOf(' ')==-1)&&(laenge.indexOf(' ')==-1)){
		//get data
		if(cache[hash]){
		    ans=JSON.parse(JSON.stringify(cache[hash]));
		}else{
		    try {
			ans=JSON.parse(execSync(cmd,[],{ encoding: 'utf8' }));
			//console.log(JSON.stringify(ans,"",2));
		    }
		    catch {
			process.stderr.write('error: (länge='+laenge+',breite='+breite+'): '+Gemeinde+'/'+Gebiet+'\n')
		    }
		    let dister=Math.round(Math.sqrt(ans[0].dist)*100000.0*100.0)/100.0;
		    if(dister<0.9999){
			//process.stderr.write(JSON.stringify(ans,null,2)+'\n');
			cache[hash] = JSON.parse(JSON.stringify(ans));
			//cache[hash] = Object.create(ans);
		    }
		}
		dist=Math.round(Math.sqrt(ans[0].dist)*100000.0*100.0)/100.0;
		if(dist>maxDist){
		    if(fehlend==''){
			ans=[ { id: "", latitude: -999.9, longitude: -999.9, dist: dist } ];
			process.stderr.write(place+' --> dist='+dist+'m \t\t('+laenge+','+breite+')\n')
		    }else{
			ans=[ { id: "", latitude: -999.9, longitude: -999.9, dist: -999.9 } ];
		    }
		}else{
		    ans[0].dist=dist
		}
	    }else{
		process.stderr.write(place+' ==> länge=\"'+laenge+'\", breite=\"'+breite+'\"\n')
		ans=[ { id: "", latitude: -999.9, longitude: -999.9, dist: -999.9 } ];
	    }

	    let autochton=''
	    let natural=''
	    
            switch(Natuerlich){
	    /*
	    case '':
	    case ' ':
	    case '-':
		autochton='';
		natural='';
		break;
            */
	    case 'N':
		autochton='yes';
		natural='yes'
		break;
	    case 'N ?':
	    case 'N?':
	    case 'N/P?':
	    case 'P?':
	    case 'P  (?)':
		autochton='maybe';
		natural='maybe';
		break;
	    case 'P (von N)':
		autochton='yes';
		natural='no'
		break;
	    case 'N (tot)':
	    case 'N (tot) ':
	    case 'P (tot)':
	    case 'P? (tot)':
		autochton='';
		natural='';
		break;
	    default:
		if(Natuerlich.indexOf('P')==0){
		    autochton='no';
		    natural='no';
		}
		break;
	    }
	    
	    project[i]['id']=ans[0].id;
	    project[i]['plantation_year']='';
	    project[i]['hash']=hash;
	    project[i]['autochton']=autochton;
	    project[i]['natural']=natural;
	    project[i]['latitude']=ans[0].latitude;
	    project[i]['longitude']=ans[0].longitude;
	    project[i]['dist']=ans[0].dist;
	    
        }else{
	    project.splice(i,1);
	    process.stderr.write('     leere zeile gelöscht\n')
	}
    }

    fs.writeFileSync(path,JSON.stringify(cache,null,2),{encoding:'utf8', flag:'w'});
    process.stdout.write(JSON.stringify(project,null,2)+'\n');
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


