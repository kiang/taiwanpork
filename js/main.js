var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });
var jsonFiles, filesLength, fileKey = 0;

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
for (var z = 0; z < 20; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}

var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.221507, 23.000694]),
  zoom: 14
});

var vectorPoints = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON({
      featureProjection: appView.getProjection()
    })
  }),
  style: pointStyleFunction
});

var baseLayer = new ol.layer.Tile({
    source: new ol.source.WMTS({
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        url: 'https://wmts.nlsc.gov.tw/wmts',
        layer: 'EMAP',
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        }),
        style: 'default',
        wrapX: true,
        attributions: '<a href="http://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
    }),
    opacity: 0.8
});

var map = new ol.Map({
  layers: [baseLayer, vectorPoints],
  target: 'map',
  view: appView
});

map.addControl(sidebar);
var pointClicked = false;
map.on('singleclick', function(evt) {
  content.innerHTML = '';
  pointClicked = false;
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if(false === pointClicked) {
      var p = feature.getProperties();
      var targetHash = '#' + p.badge_code;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      pointClicked = true;
    }
  });
});

function pointStyleFunction(f) {
  var p = f.getProperties(), color, stroke, radius;
  if(f === currentFeature) {
    stroke = new ol.style.Stroke({
      color: '#000',
      width: 5
    });
    radius = 25;
  } else {
    stroke = new ol.style.Stroke({
      color: '#fff',
      width: 2
    });
    radius = 15;
  }
  color = '#48c774';
  return new ol.style.Style({
    image: new ol.style.RegularShape({
      radius: radius,
      points: 5,
      fill: new ol.style.Fill({
        color: color
      }),
      stroke: stroke
    })
  })
}

var previousFeature = false;
var currentFeature = false;
function showPoint(pointId) {
  firstPosDone = true;
  $('#findPoint').val(pointId);
  
  var features = vectorPoints.getSource().getFeatures();
  var pointFound = false;
  for(k in features) {
    var p = features[k].getProperties();
    if(p.badge_code === pointId) {
      currentFeature = features[k];
      features[k].setStyle(pointStyleFunction(features[k]));
      if(false !== previousFeature) {
        previousFeature.setStyle(pointStyleFunction(previousFeature));
      }
      previousFeature = currentFeature;
      appView.setCenter(features[k].getGeometry().getCoordinates());
      appView.setZoom(15);
      var lonLat = ol.proj.toLonLat(p.geometry.getCoordinates());
      var message = '<table class="table table-dark">';
      message += '<tbody>';
      message += '<tr><th scope="row" style="width: 100px;">名稱</th><td>';
      //message += '<a href="#' + p.badge_code + '" target="_blank">' + p.market_name + '</a>';
      message += p.market_name;
      message += '</td></tr>';
      message += '<tr><th scope="row">標章代碼</th><td>' + p.badge_code + '</td></tr>';
      message += '<tr><th scope="row">介紹</th><td>' + p.context.replace(/\\n/g, '<br />') + '</td></tr>';
      message += '<tr><th scope="row">住址</th><td>' + p.addr + '</td></tr>';
      message += '<tr><th scope="row">營業天</th><td>' + p.business_week + '</td></tr>';
      message += '<tr><th scope="row">營業時間</th><td>' + ((p.business_hours) ? p.business_hours : '')
        + ' - ' + ((p.business_hours_end) ? p.business_hours_end : '') + '</td></tr>';
      message += '<tr><th scope="row">有效日期</th><td>' + p.ValidDate + '</td></tr>';
      message += '<tr><th scope="row">更新時間</th><td>' + p.last_edited_date + '</td></tr>';
      message += '<tr><td colspan="2">';
      message += '<hr /><div class="btn-group-vertical" role="group" style="width: 100%;">';
      message += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + lonLat[1] + ',' + lonLat[0] + '&travelmode=driving" target="_blank" class="btn btn-info btn-lg btn-block">Google 導航</a>';
      message += '<a href="https://wego.here.com/directions/drive/mylocation/' + lonLat[1] + ',' + lonLat[0] + '" target="_blank" class="btn btn-info btn-lg btn-block">Here WeGo 導航</a>';
      message += '<a href="https://bing.com/maps/default.aspx?rtp=~pos.' + lonLat[1] + '_' + lonLat[0] + '" target="_blank" class="btn btn-info btn-lg btn-block">Bing 導航</a>';
      message += '</div></td></tr>';
      message += '</tbody></table>';
      sidebarTitle.innerHTML = p.market_name;
      content.innerHTML = message;
    }
  }
  sidebar.open('home');
}

var geolocation = new ol.Geolocation({
  projection: appView.getProjection()
});

geolocation.setTracking(true);

geolocation.on('error', function(error) {
  console.log(error.message);
});

var positionFeature = new ol.Feature();

positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

var firstPosDone = false;
geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
  if(false === firstPosDone) {
    appView.setCenter(coordinates);
    firstPosDone = true;
  }
});

new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [positionFeature]
  })
});

$('#btn-geolocation').click(function () {
  var coordinates = geolocation.getPosition();
  if(coordinates) {
    appView.setCenter(coordinates);
  } else {
    alert('目前使用的設備無法提供地理資訊');
  }
  return false;
});

var findTerms = [];
$.getJSON('data.json', {}, function(points) {
  var vSource = vectorPoints.getSource();
  var pointFeatures = [];
  for(k in points) {
    var pointFeature = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([parseFloat(points[k].Lontitude), parseFloat(points[k].Latitude)])
      )
    });
    pointFeature.setProperties(points[k]);
    pointFeatures.push(pointFeature);

    findTerms.push({
      value: points[k].badge_code,
      label: points[k].badge_code + ' ' + points[k].market_name + ' ' + points[k].addr
    });
  }
  vSource.addFeatures(pointFeatures);
  routie(':pointId', showPoint);

  $('#findPoint').autocomplete({
    source: findTerms,
    select: function(event, ui) {
      var targetHash = '#' + ui.item.value;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  });
});