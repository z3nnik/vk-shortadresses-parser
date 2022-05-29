const ExecuteCode: string = `var sn = (Args.sn).split(',');
var i = 0;
var results = [];
while(i < sn.length) {
  var res = API.utils.resolveScreenName({
    screen_name: sn[i]
  });
  
  if(!res.length){
    results.push({ screen_name: sn[i], is_free: true });
  } else {
    results.push({ screen_name: sn[i], is_free: false, object_id: res.object_id, type: res.type });
  }
  
  i = i+1;
};

return results;`;


export default ExecuteCode;