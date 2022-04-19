const fs = require("fs");

const zlib = require('zlib');

var log_array = [];

var cache = {
  remote_addr: {},
  country: {},
  time_avg: 0,
  total_logs: 0
}

readFiles('/var/log/nginx');

function readFiles(dirname){
  let files = fs.readdirSync(dirname),
      len = files.length;
  for(var i = 0; i<len; i++){
    let check = files[i].split('.');
    if(check[0] == "json_access"){
      if(check[check.length-1] !== "gz"){
        parseData(fs.readFileSync(`${dirname}/${files[i]}`).toString())
      }else{
        parseData(decompFile(`${dirname}/${files[i]}`)) 
      }
    }   
  }
  cache.time_avg = cache.time_avg/cache.total_logs;
  console.log(cache)
}

function parseData(data){
  log_array = data.split('\n');
  var len = log_array.length-1;
  for(var i = 0; i<len; i++) {
    parseLog(JSON.parse(log_array[i]))
  }
   
}

function parseLog(log){

  cache.total_logs++;
  cache.time_avg += parseFloat(log.request_time);

  var temp;

  // address handle
  temp = cache.remote_addr[log.remote_addr];
  cache.remote_addr[log.remote_addr] = temp? temp+1: 1;

  // country handle
  temp = cache.country[log.geoip_country_code]; 
  cache.country[log.geoip_country_code] = temp? temp+1: 1;  

}

function decompFile(filename){
  if(!filename) return console.error('no filename supplied to function decompFile!');
  return zlib.gunzipSync(fs.readFileSync(filename)).toString();
}
