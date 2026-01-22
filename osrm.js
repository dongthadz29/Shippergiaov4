const map = L.map('map').setView([10.7769,106.7009],15);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
  maxZoom:20
}).addTo(map);

let myPos=null;
let lastPos=null;
let myMarker=null;
let arrowIcon=null;
let target=null;
let routeLine=L.polyline([],{color:'blue'}).addTo(map);

let locations=JSON.parse(localStorage.getItem('locations')||'[]');
let trash=JSON.parse(localStorage.getItem('trash')||'[]');

const address=document.getElementById('address');
const distanceBox=document.getElementById('distanceBox');

function save(){
  localStorage.setItem('locations',JSON.stringify(locations));
  localStorage.setItem('trash',JSON.stringify(trash));
}

/* ===== GPS ===== */
navigator.geolocation.watchPosition(pos=>{
  myPos=[pos.coords.latitude,pos.coords.longitude];

  if(!myMarker){
    arrowIcon=L.divIcon({
      className:'',
      html:'<div class="my-arrow">▲<div style="font-size:10px">Tôi</div></div>',
      iconSize:[30,30],
      iconAnchor:[15,15]
    });

    myMarker=L.marker(myPos,{icon:arrowIcon}).addTo(map);
    map.setView(myPos,17);
  }else{
    myMarker.setLatLng(myPos);
  }

  if(lastPos){
    const bearing=getBearing(lastPos,myPos);
    myMarker.getElement().style.transform=`rotate(${bearing}deg)`;
  }

  lastPos=myPos;

  if(target) drawRoute();

},{
  enableHighAccuracy:true,
  maximumAge:1000,
  timeout:10000
});

/* ===== Click map ===== */
let tempLatLng=null;
map.on('click',e=>{
  tempLatLng=e.latlng;
  address.value=`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
});

/* ===== Add location ===== */
function addLocation(){
  if(!tempLatLng) return alert('Chưa chọn vị trí');

  const item={
    id:Date.now(),
    customer:customer.value,
    phone:phone.value,
    note:note.value,
    lat:tempLatLng.lat,
    lng:tempLatLng.lng
  };

  locations.push(item);
  save();
  renderLocations();
  tempLatLng=null;
  address.value='';
}

/* ===== Render ===== */
function renderLocations(){
  locationList.innerHTML='';
  locations.forEach(l=>{
    const d=document.createElement('div');
    d.className='location-item';
    d.innerHTML=`<b>${l.customer}</b><br>${l.phone}`;
    d.onclick=()=>{
      target=[l.lat,l.lng];
      map.setView(target,17);
      drawRoute();
    };
    locationList.appendChild(d);
  });
}

function drawRoute(){
  routeLine.setLatLngs([myPos,target]);
  const d=map.distance(myPos,target);
  distanceBox.textContent=d<1000?`Còn ${Math.round(d)} m`:`Còn ${(d/1000).toFixed(2)} km`;
  distanceBox.style.display='block';
}

/* ===== Bearing ===== */
function getBearing(a,b){
  const lat1=a[0]*Math.PI/180;
  const lat2=b[0]*Math.PI/180;
  const dLon=(b[1]-a[1])*Math.PI/180;
  const y=Math.sin(dLon)*Math.cos(lat2);
  const x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}

/* ===== Search ===== */
function searchLocation(){
  const q=search.value.toLowerCase();
  renderLocations(locations.filter(l=>
    l.customer.toLowerCase().includes(q)||l.phone.includes(q)
  ));
}

/* ===== Trash ===== */
function toggleTrash(){
  trashBox.style.display=trashBox.style.display==='block'?'none':'block';
}

renderLocations();
