let routeLine=null;

function drawOSRMRoute(from,to){
  if(!from||!to) return;
  if(routeLine) map.removeLayer(routeLine);

  const url=`https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;

  fetch(url).then(r=>r.json()).then(d=>{
    const r0=d.routes[0];
    routeLine=L.geoJSON(r0.geometry,{
      style:{color:'red',weight:6}
    }).addTo(map);

    const step=r0.legs[0].steps[0].maneuver;
    showNav(step);
  });
}

function showNav(m){
  let txt='⬆️ Đi thẳng';
  if(m.type==='turn'){
    txt=m.modifier==='left'?'⬅️ Rẽ trái':'➡️ Rẽ phải';
  }
  navBox.innerText=txt;
  navBox.style.display='block';
}
