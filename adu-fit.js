(function () {
  'use strict';

  var origin = { lat: 37.6391, lng: -120.9969 };
  var searched = false;
  var addressText = '';
  var countyName = '';
  var parcelGeo = null;
  var parcelSource = 'Manual outline';
  var parcelAPN = '';
  var placementTouched = false;
  var autoPlacementFound = false;
  var map = L.map('map', { zoomControl: true, maxZoom: 22 }).setView([origin.lat, origin.lng], 19);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    maxNativeZoom: 20,
    attribution: 'Imagery © Esri and contributors'
  }).addTo(map);
  L.tileLayer('https://tiles.arcgis.com/tiles/KzeiCaQsMoeCfoCq/arcgis/rest/services/Regrid_Nationwide_Parcel_Boundaries_v1/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 15,
    maxZoom: 22,
    maxNativeZoom: 17,
    opacity: 0.62,
    attribution: 'Parcel reference © Regrid'
  }).addTo(map);
  L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    maxNativeZoom: 20,
    attribution: 'Labels © Esri'
  }).addTo(map);

  var parcelSources = {
    'stanislaus': { name: 'Stanislaus County Public Parcels', url: 'https://services.arcgis.com/EeYBJFxLdUojipYa/arcgis/rest/services/Public_Parcels/FeatureServer/0' },
    'san joaquin': { name: 'San Joaquin County Tax Parcels', url: 'https://services2.arcgis.com/GQhSReJEO6f7tsvy/arcgis/rest/services/Tax_Parcels/FeatureServer/0' },
    'fresno': { name: 'Fresno County Regional Parcels', url: 'https://services3.arcgis.com/ibgDyuD2DLBge82s/arcgis/rest/services/REGIONAL_PARCELS_VW/FeatureServer/11' },
    'kern': { name: 'Kern County Assessor Parcels', url: 'https://services5.arcgis.com/Y8jwjGUWbRjuqpG5/arcgis/rest/services/Assessor_Parcels_Land_2025/FeatureServer/0' },
    'los angeles': { name: 'Los Angeles County Parcels', url: 'https://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Parcel/MapServer/0' },
    'merced': { name: 'Merced County Parcels', url: 'https://services2.arcgis.com/pp15b0fTKaiCm2n7/arcgis/rest/services/Merced_County_Parcels_View_Layer/FeatureServer/0' },
    'san diego': { name: 'SANDAG Parcels', url: 'https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0' },
    'santa clara': { name: 'Santa Clara County Public Parcels', url: 'https://services2.arcgis.com/tcv2cMrq63AgvbHF/arcgis/rest/services/Parcels_Public_View/FeatureServer/0' },
    'contra costa': { name: 'Contra Costa County Assessment Parcels', url: 'https://gis.cccounty.us/arcgis/rest/services/CCMAP/Assessment_Parcels_ArcPro/MapServer/0' }
  };

  var vals = {
    lotWidth: 60, lotDepth: 110, lotAngle: 0, edgeClearance: 4, structureGap: 6,
    houseWidth: 42, houseDepth: 45, houseAngle: 0, aduWidth: 25, aduDepth: 30, aduAngle: 0
  };
  var lotCenter = { lat: origin.lat, lng: origin.lng };
  var houseCenter;
  var aduCenter;
  var layers = {};
  var markers = {};

  function el(id) { return document.getElementById(id); }
  function num(id) { return Number(el(id).value) || 0; }
  function rad(degrees) { return degrees * Math.PI / 180; }
  function move(center, east, north) {
    return { lat: center.lat + north / 111320, lng: center.lng + east / (111320 * Math.cos(rad(center.lat))) };
  }
  function local(center, x, y, angle) {
    var a = rad(angle);
    return move(center, x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a));
  }
  function rect(center, width, depth, angle) {
    return [
      local(center, -width / 2, -depth / 2, angle), local(center, width / 2, -depth / 2, angle),
      local(center, width / 2, depth / 2, angle), local(center, -width / 2, depth / 2, angle)
    ];
  }
  function geo(points) {
    var coordinates = points.map(function (point) { return [point.lng, point.lat]; });
    coordinates.push(coordinates[0]);
    return turf.polygon([coordinates]);
  }
  function manualParcel() { return geo(rect(lotCenter, vals.lotWidth, vals.lotDepth, vals.lotAngle)); }
  function activeParcel() { return parcelGeo || manualParcel(); }
  function marker(center, color, label) {
    return L.marker(center, {
      draggable: true,
      icon: L.divIcon({ className: '', html: '<div class="drag-icon" style="background:' + color + '" title="Drag ' + label + '"></div>', iconSize: [24, 24], iconAnchor: [12, 12] })
    }).addTo(map);
  }
  function removeLayer(name) {
    if (layers[name]) { map.removeLayer(layers[name]); layers[name] = null; }
  }
  function setGeoLayer(name, feature, style, label, labelClass) {
    removeLayer(name);
    layers[name] = L.geoJSON(feature, { style: style }).addTo(map);
    if (label) layers[name].bindTooltip(label, { permanent: true, direction: 'center', className: labelClass });
    return layers[name];
  }
  function normalizeCounty(value) {
    return String(value || '').replace(/\s+County$/i, '').trim().toLowerCase();
  }
  function pointFeature(center) { return turf.point([center.lng, center.lat]); }
  function featureCenter(feature) {
    var center = turf.centerOfMass(feature).geometry.coordinates;
    return { lat: center[1], lng: center[0] };
  }
  function safeBuildable() {
    try {
      return turf.buffer(activeParcel(), -Math.max(0, vals.edgeClearance), { units: 'feet', steps: 16 }) || null;
    } catch (error) { return null; }
  }
  function parcelArea() { return Math.round(turf.area(activeParcel()) * 10.7639); }
  function setStage(stage) {
    document.querySelectorAll('.progress li').forEach(function (item) {
      item.classList.toggle('active', Number(item.getAttribute('data-stage')) <= stage);
    });
  }
  function resetCenters() {
    placementTouched = false; autoPlacementFound = false;
    if (parcelGeo) {
      houseCenter = { lat: lotCenter.lat, lng: lotCenter.lng };
      chooseAduPlacement();
    } else {
      houseCenter = local(lotCenter, 0, -vals.lotDepth / 2 + 20 + vals.houseDepth / 2, vals.lotAngle);
      aduCenter = local(lotCenter, 0, vals.lotDepth / 2 - vals.edgeClearance - vals.aduDepth / 2 - 2, vals.lotAngle);
    }
  }
  function chooseAduPlacement() {
    var build = safeBuildable();
    placementTouched = false; autoPlacementFound = false;
    if (!build) { aduCenter = featureCenter(activeParcel()); return false; }
    var bbox = turf.bbox(build);
    var house = geo(rect(houseCenter, vals.houseWidth, vals.houseDepth, vals.houseAngle));
    var houseZone = turf.buffer(house, vals.structureGap, { units: 'feet' });
    var best = null;
    var bestDistance = -1;
    for (var x = 0; x <= 32; x += 1) {
      for (var y = 0; y <= 32; y += 1) {
        var lng = bbox[0] + (bbox[2] - bbox[0]) * x / 32;
        var lat = bbox[1] + (bbox[3] - bbox[1]) * y / 32;
        var candidate = { lat: lat, lng: lng };
        var adu = geo(rect(candidate, vals.aduWidth, vals.aduDepth, vals.aduAngle));
        var fullyInside = turf.booleanWithin(adu, build);
        if (fullyInside && turf.booleanDisjoint(adu, houseZone)) {
          var distance = turf.distance(pointFeature(candidate), pointFeature(houseCenter), { units: 'feet' });
          if (distance > bestDistance) { bestDistance = distance; best = candidate; }
        }
      }
    }
    autoPlacementFound = Boolean(best);
    aduCenter = best || featureCenter(build);
    return autoPlacementFound;
  }
  function sync() {
    Object.keys(vals).forEach(function (key) { if (el(key)) vals[key] = num(key); });
    el('lotAngleValue').textContent = vals.lotAngle + '°';
    el('houseAngleValue').textContent = vals.houseAngle + '°';
    el('aduAngleValue').textContent = vals.aduAngle + '°';
    draw();
  }
  function draw() {
    var parcel = activeParcel();
    var build = safeBuildable();
    var house = geo(rect(houseCenter, vals.houseWidth, vals.houseDepth, vals.houseAngle));
    var adu = geo(rect(aduCenter, vals.aduWidth, vals.aduDepth, vals.aduAngle));
    setGeoLayer('lot', parcel, { color: '#111', weight: 3, fillColor: '#111', fillOpacity: 0.05, dashArray: parcelGeo ? null : '7 6' });
    if (build) setGeoLayer('build', build, { color: '#178354', weight: 2, fillColor: '#178354', fillOpacity: 0.09, dashArray: '5 5' }); else removeLayer('build');
    setGeoLayer('house', house, { color: '#245f99', weight: 2, fillColor: '#245f99', fillOpacity: 0.28 }, 'Existing home', 'house-label');
    var inside = Boolean(build) && turf.booleanWithin(adu, build);
    var houseZone = turf.buffer(house, vals.structureGap, { units: 'feet' });
    var clear = turf.booleanDisjoint(adu, houseZone);
    var fits = inside && clear;
    var awaitingPlacement = searched && !autoPlacementFound && !placementTouched;
    var aduColor = awaitingPlacement ? '#a66b08' : fits ? '#178354' : '#c23b32';
    setGeoLayer('adu', adu, { color: aduColor, weight: 4, fillColor: aduColor, fillOpacity: 0.38 }, Math.round(vals.aduWidth * vals.aduDepth) + ' sq ft ADU', 'adu-label');
    markers.lot.setLatLng(lotCenter);
    markers.house.setLatLng(houseCenter);
    markers.adu.setLatLng(aduCenter);
    var box = el('status');
    box.className = 'status ' + (fits ? 'good' : 'bad');
    if (!searched) {
      box.className = 'status'; el('statusTitle').textContent = 'Enter an address to begin'; el('statusText').textContent = 'The parcel border will load automatically where a supported public source is available.';
    } else if (awaitingPlacement) {
      box.className = 'status'; el('statusTitle').textContent = 'Place the ADU on the property'; el('statusText').textContent = 'Drag the green-and-gold ADU handle into the yard. Align the blue home outline if needed; the result will update as you move it.';
    } else if (fits) {
      el('statusTitle').textContent = 'Likely fits under these assumptions'; el('statusText').textContent = 'The ADU is inside the green planning envelope and clear of the approximate home footprint.';
    } else {
      el('statusTitle').textContent = 'Placement conflict detected'; el('statusText').textContent = !build ? 'The parcel is too small for the selected edge clearance.' : !inside ? 'Move or rotate the ADU until it is completely inside the green area.' : 'Move the ADU farther from the approximate existing-home footprint.';
    }
    window.fitResult = awaitingPlacement ? 'Placement not yet confirmed' : fits ? 'Likely fits under entered assumptions' : 'Placement conflict detected';
  }
  function extractAPN(properties) {
    var keys = Object.keys(properties || {});
    var match = keys.find(function (key) { return /(^|_)(apn|parcel.?id|ain)(_|$)/i.test(key); });
    return match ? String(properties[match] || '') : '';
  }
  function selectFeature(features, center) {
    var point = pointFeature(center);
    var valid = (features || []).filter(function (feature) { return feature && feature.geometry && /Polygon/.test(feature.geometry.type); });
    var containing = valid.find(function (feature) {
      try { return turf.booleanPointInPolygon(point, feature); } catch (error) { return false; }
    });
    if (containing) return containing;
    return valid.sort(function (a, b) {
      return turf.distance(point, turf.centerOfMass(a), { units: 'feet' }) - turf.distance(point, turf.centerOfMass(b), { units: 'feet' });
    })[0] || null;
  }
  function queryParcel(center, county) {
    var source = parcelSources[normalizeCounty(county)];
    if (!source) return Promise.resolve(null);
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    var params = new URLSearchParams({
      geometry: center.lng + ',' + center.lat,
      geometryType: 'esriGeometryPoint', inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
      distance: '35', units: 'esriSRUnit_Meter', outFields: '*', returnGeometry: 'true', outSR: '4326',
      resultRecordCount: '10', f: 'geojson'
    });
    return fetch(source.url + '/query?' + params.toString(), { headers: { Accept: 'application/geo+json,application/json' }, signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('parcel service'); return response.json(); })
      .then(function (data) {
        if (data.error) throw new Error(data.error.message || 'parcel service');
        var feature = selectFeature(data.features, center);
        if (!feature) return null;
        return { feature: feature, source: source.name, apn: extractAPN(feature.properties) };
      }).catch(function () { return null; })
      .finally(function () { clearTimeout(timeout); });
  }
  function useManualParcel(message) {
    parcelGeo = null; parcelSource = 'Manual outline'; parcelAPN = '';
    document.body.classList.remove('has-parcel');
    markers.lot.setOpacity(1); markers.lot.dragging.enable();
    el('manualLot').open = true;
    el('parcelMode').className = 'parcel-readout';
    el('parcelMode').textContent = message + ' Parcel reference lines are still shown where available. Use the black handle and manual dimensions to align the dashed outline.';
    setStage(2); resetCenters(); draw();
  }
  function geocodeAddress(query) {
    var nominatim = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&addressdetails=1&q=' + encodeURIComponent(query);
    return fetch(nominatim, { headers: { Accept: 'application/json' } })
      .then(function (response) { if (!response.ok) return []; return response.json(); })
      .catch(function () { return []; })
      .then(function (rows) {
        if (rows.length) return rows[0];
        var esri = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&countryCode=USA&maxLocations=1&outFields=Subregion,Region,Postal&SingleLine=' + encodeURIComponent(query);
        return fetch(esri, { headers: { Accept: 'application/json' } })
          .then(function (response) { if (!response.ok) throw new Error('address service'); return response.json(); })
          .then(function (data) {
            if (!data.candidates || !data.candidates.length) throw new Error('not found');
            var candidate = data.candidates[0];
            return { lat: candidate.location.y, lon: candidate.location.x, display_name: candidate.address, address: { county: candidate.attributes.Subregion || '' } };
          });
      });
  }
  function findAddress() {
    var query = el('address').value.trim();
    if (!query) return;
    var button = el('find');
    button.disabled = true; button.textContent = 'Finding…'; el('searchNote').textContent = 'Locating the address…';
    geocodeAddress(query)
      .then(function (row) {
        var center = { lat: Number(row.lat), lng: Number(row.lon) };
        searched = true; addressText = row.display_name; countyName = row.address.county || '';
        lotCenter = center; houseCenter = { lat: center.lat, lng: center.lng }; aduCenter = move(center, 0, 45);
        el('mapAddress').textContent = addressText;
        map.setView([center.lat, center.lng], 20);
        el('searchNote').textContent = 'Address found. Looking up the parcel boundary…';
        return queryParcel(center, countyName).then(function (result) { return { result: result, center: center }; });
      })
      .then(function (payload) {
        if (!payload.result) {
          useManualParcel(countyName ? 'An automatic polygon was not returned for ' + countyName + '.' : 'The county could not be identified.');
          el('searchNote').textContent = 'Found: ' + addressText;
          return;
        }
        parcelGeo = payload.result.feature; parcelSource = payload.result.source; parcelAPN = payload.result.apn;
        document.body.classList.add('has-parcel'); setStage(3);
        markers.lot.setOpacity(0); markers.lot.dragging.disable(); el('manualLot').open = false;
        el('parcelMode').className = 'parcel-readout loaded';
        el('parcelMode').textContent = 'Public parcel loaded from ' + parcelSource + (parcelAPN ? ' · APN ' + parcelAPN : '') + ' · approximately ' + parcelArea().toLocaleString() + ' sq ft.';
        el('resultCounty').textContent = countyName || 'California';
        el('resultParcel').textContent = parcelAPN || 'Loaded';
        el('resultArea').textContent = parcelArea().toLocaleString() + ' sq ft';
        el('mapAddress').textContent = addressText;
        houseCenter = payload.center; chooseAduPlacement(); draw();
        map.fitBounds(L.geoJSON(parcelGeo).getBounds(), { padding: [42, 42], maxZoom: 21 });
        el('searchNote').textContent = 'Found: ' + addressText;
        if (window.innerWidth <= 880) setTimeout(function () { document.querySelector('.map-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
      })
      .catch(function () { el('searchNote').textContent = 'Address not found. Try including the city, state, and ZIP code.'; })
      .finally(function () { button.disabled = false; button.textContent = 'Check lot'; });
  }

  markers.lot = marker(lotCenter, '#111', 'parcel');
  resetCenters();
  markers.house = marker(houseCenter, '#245f99', 'home');
  markers.adu = marker(aduCenter, '#178354', 'ADU');
  markers.lot.on('drag', function (event) {
    if (parcelGeo) return;
    var previous = lotCenter; var next = event.target.getLatLng();
    var east = (next.lng - previous.lng) * 111320 * Math.cos(rad(previous.lat));
    var north = (next.lat - previous.lat) * 111320;
    lotCenter = { lat: next.lat, lng: next.lng };
    houseCenter = move(houseCenter, east, north); aduCenter = move(aduCenter, east, north); draw();
  });
  markers.house.on('drag', function (event) { placementTouched = true; houseCenter = event.target.getLatLng(); draw(); });
  markers.adu.on('drag', function (event) { placementTouched = true; aduCenter = event.target.getLatLng(); draw(); });
  Object.keys(vals).forEach(function (id) { if (el(id)) el(id).addEventListener('input', function () { if (!/^lot/.test(id)) placementTouched = true; sync(); }); });
  el('aduPreset').addEventListener('change', function () {
    if (this.value === 'custom') return;
    var dimensions = this.value.split(','); el('aduWidth').value = dimensions[0]; el('aduDepth').value = dimensions[1];
    vals.aduWidth = Number(dimensions[0]); vals.aduDepth = Number(dimensions[1]); chooseAduPlacement(); draw();
  });
  document.querySelectorAll('.model-choice').forEach(function (choice) {
    choice.addEventListener('click', function () {
      document.querySelectorAll('.model-choice').forEach(function (item) { item.classList.remove('selected'); });
      choice.classList.add('selected');
      var dimensions = choice.getAttribute('data-size').split(',');
      el('aduPreset').value = choice.getAttribute('data-size');
      el('aduWidth').value = dimensions[0]; el('aduDepth').value = dimensions[1];
      vals.aduWidth = Number(dimensions[0]); vals.aduDepth = Number(dimensions[1]);
      if (searched) setStage(3);
      chooseAduPlacement(); draw();
    });
  });
  el('find').addEventListener('click', findAddress);
  el('address').addEventListener('keydown', function (event) { if (event.key === 'Enter') findAddress(); });
  el('reset').addEventListener('click', function () { resetCenters(); draw(); });
  el('autoPlace').addEventListener('click', function () { chooseAduPlacement(); draw(); });
  el('zoom').addEventListener('click', function () {
    if (parcelGeo) map.fitBounds(L.geoJSON(parcelGeo).getBounds(), { padding: [42, 42], maxZoom: 21 }); else map.setView(lotCenter, 20);
  });
  ['name', 'email', 'phone'].forEach(function (id) { el(id).addEventListener('focus', function () { if (searched) setStage(4); }); });

  if (window.emailjs) emailjs.init('alap2C2Fda-y4hFG8');
  el('submit').addEventListener('click', function () {
    var name = el('name').value.trim(); var email = el('email').value.trim(); var phone = el('phone').value.trim();
    var note = el('formNote'); var button = this;
    if (!searched) { note.textContent = 'Please search the property address first.'; return; }
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length < 10 || !el('consent').checked) {
      note.textContent = 'Please enter your name, valid email and phone, and accept the contact notice.'; return;
    }
    var message = [
      'NEW ADU FIT CHECK', 'Address: ' + addressText, 'County: ' + (countyName || 'Unknown'),
      'Parcel source: ' + parcelSource, 'APN: ' + (parcelAPN || 'Not returned'),
      'Approximate parcel area: ' + parcelArea().toLocaleString() + ' sq ft', 'Result: ' + window.fitResult,
      'Parcel-edge clearance assumption: ' + vals.edgeClearance + ' ft',
      'Existing home assumption: ' + vals.houseWidth + ' × ' + vals.houseDepth + ' ft at ' + vals.houseAngle + '°',
      'House clearance assumption: ' + vals.structureGap + ' ft',
      'ADU footprint: ' + vals.aduWidth + ' × ' + vals.aduDepth + ' ft (' + (vals.aduWidth * vals.aduDepth) + ' sq ft) at ' + vals.aduAngle + '°',
      'Map location: ' + lotCenter.lat.toFixed(6) + ', ' + lotCenter.lng.toFixed(6),
      'Parcel GIS, imagery, building outline, clearances, and placement are preliminary and require professional verification.'
    ].join('\n');
    var payload = { user_name: name, user_email: email, user_phone: phone, user_address: addressText, project_type: 'ADU Fit Check', message: message, sqft: String(vals.aduWidth * vals.aduDepth), estimate_range: 'Property review requested', source: 'Forma ADU Fit Check' };
    if (!window.emailjs) { note.textContent = 'The lead service is still loading. Please try again.'; return; }
    button.disabled = true; button.textContent = 'Sending…';
    Promise.all([emailjs.send('service_d8l3yh6', 'template_f5ctunh', payload), emailjs.send('service_d8l3yh6', 'template_ebamer7', payload)])
      .then(function () { note.textContent = 'Received. Forma will review your fit check and contact you.'; button.textContent = 'Fit check sent ✓'; })
      .catch(function () { note.textContent = 'The request did not send. Please try again or call (209) 449-6705.'; button.disabled = false; button.textContent = 'Send my ADU fit check →'; });
  });

  draw();
  setTimeout(function () { map.invalidateSize(); }, 100);
})();
