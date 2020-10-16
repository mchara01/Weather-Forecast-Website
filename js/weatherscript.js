function cleanAll() {
	document.querySelector('#addressField').value = '';
	document.querySelector('#regionField').value = '';;
	document.querySelector('#cityField').value = 'Select city';

	document.querySelector('#wrong-address').classList.add('hidden');
   document.querySelector('#wrong-region').classList.add('hidden');
   document.querySelector('#wrong-city').classList.add('hidden');

   document.querySelector('#celsius').checked = true;
   document.querySelector('#fahrenheit').checked = false;
	
	document.querySelector('#resultSection').classList.add('d-none');
	document.getElementById("map").innerHTML = "";
}

function validationCheck() {
	
	let address = document.querySelector('#addressField').value;
   let region = document.querySelector('#regionField').value;
   let city = document.querySelector('#cityField').value;
   let units;
	
	if ( address === '' || address.match(/\S/g) === null) {
		document.querySelector('#wrong-address').classList.remove('hidden');		
	} else {
		document.querySelector('#wrong-address').classList.add('hidden');
	}
	
	if (region === '' || region.match(/\S/g) === null ) {
		document.querySelector('#wrong-region').classList.remove('hidden');
	} else {
		document.querySelector('#wrong-region').classList.add('hidden');
	}

	if (city === 'Select city') {
		document.querySelector('#wrong-city').classList.remove('hidden');
	} else {
		document.querySelector('#wrong-city').classList.add('hidden');
	}
	
	if (document.querySelector('#celsius').checked === true) {
      units = "metric";
   } else {
      units = "imperial";
   }

	if ( address === '' || region === ''  || city === 'Select city' || address.match(/\S/g) === null || region.match(/\S/g) === null){
		document.querySelector('#resultSection').classList.add('d-none');
		return;
	}else {
		document.querySelector('#next24-tab').classList.remove('active');
		document.querySelector('#rightNow-tab').classList.add('active');
		let tab_contents = document.querySelector('#next24').classList.remove('active');
		tab_contents = document.querySelector('#next24').classList.remove('show');
		tab_contents = document.querySelector('#rightNow').classList.add('active');
		tab_contents = document.querySelector('#rightNow').classList.add('show');
		nominatimSearch(address, region, city, units);
	}
	
}

function serverPost() {
	var xhr = new XMLHttpRequest(); 
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) 
			return; 
		// The following is comment out because it is not
		// needed. Nothing will happen at the javascript's
		// side whether an error occured or not.
		
		/*
		if (xhr.status >= 200 && xhr.status < 300) { 
			
		} else if (xhr.status >= 400 && xhr.status <= 500){
			
		}*/ 
		
	};
	xhr.open('POST', './php/myphp.php');
	xhr.setRequestHeader("Content-Type", "application/json");
	
	const data = {};
	data.address = document.querySelector("#addressField").value;
	data.region = document.querySelector("#regionField").value; 
	data.city = document.querySelector("#cityField").value; 
	xhr.send(JSON.stringify(data));
} 

function serverFive(){
	
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
	var xhr = new XMLHttpRequest(); 
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) 
			return; 
		if (xhr.status >= 200 && xhr.status < 300 && xhr.getResponseHeader("Content-Type") === "application/json") { 
			const response = JSON.parse(this.responseText);
			let date;let hours; let minutes;
			for (i = 1; i <= response.length; i++) {
				
					date = new Date(response[i - 1]['timestamp'] * 1000);
					hours = date.getHours();
					minutes = "0" + date.getMinutes();
					
					document.querySelector("#logTime" + i).textContent = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + " " + hours + ":" +minutes.substr(-2);
					document.querySelector("#logAddress" + i).textContent = response[i-1]['address'];
					document.querySelector("#logRegion" + i).textContent = response[i-1]['region'];
					document.querySelector("#logCity" + i).textContent = response[i-1]['city'];
				
			}
			for (i = response.length+1; i <= 5; i++) {
				document.querySelector("#logTime" + i).textContent = "N.A.";
				document.querySelector("#logAddress" + i).textContent = "N.A.";
				document.querySelector("#logRegion" + i).textContent = "N.A.";
				document.querySelector("#logCity" + i).textContent = "N.A.";
			}
			
		}
	};
	
	xhr.open('GET', './php/myphp.php');
	xhr.send();
}

function nominatimSearch(address, region, city, units){
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () { 
		if (xhr.readyState !== 4)
			return;
		if (xhr.status >= 200 && xhr.status < 300) { 
			const response = JSON.parse(this.responseText);
			if (response.length === 0) {
				cleanAll();
				alert("No result for that location.");
			} else {
				serverPost(); // Only valid request will be inserted in the database.
				document.querySelector('#resultSection').classList.remove('d-none'); 
				const lat = response[0].lat;
				const lon = response[0].lon;
				openWeatherMapSearch(lat, lon, units);
				forecastSearch(lat, lon, units);
				mapAndLayers(lat,lon);
			}
		} else { 
			alert("Error with the request.");
		}
	};	
	
	xhr.open('GET', 'https://nominatim.openstreetmap.org/search?q=' + address + ", " + region + ", " + city + "&format=json", true);
	xhr.send();

}

function openWeatherMapSearch(lat, lon, units) {
	
	let type;
   let symbol;
   let windSpeedUnits;
   let pressureUnits;

	if (units === 'metric') {
      type = 'metric';
      symbol = ' °C';
      windSpeedUnits = ' meters/sec';
      pressureUnits = ' hPa';
   } else {
      type = 'imperial'
      symbol = ' °F';
      windSpeedUnits = ' miles/hour';
      pressureUnits = ' Mb';
   }

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () { 
		if (xhr.readyState !== 4) return;
		if (xhr.status >= 200 && xhr.status < 300) { 
			const response = JSON.parse(this.responseText);
			
			let icon = response.weather[0].icon;
         let element = document.querySelector("#icon");
         element.src = "http://openweathermap.org/img/w/" + icon + ".png";

			let description = response.weather[0].description;
         let name = response.name;
			document.querySelector('#description').textContent = description + " in " + name;
			
			let temp = response.main.temp;
			if (temp ==="")
				document.querySelector('#temp').textContent = "N.A.";
			else
				document.querySelector('#temp').textContent = temp + symbol;
			
			let temp_min = response.main.temp_min;
			if (temp_min ==="")
				document.querySelector('#temp_min').textContent = "N.A.";
			else
				document.querySelector('#temp_min').textContent = 'L:' + temp_min + symbol;

         let temp_max = response.main.temp_max;
			if (temp_max ==="")
				document.querySelector('#temp_max').textContent =  "N.A.";
			else
				document.querySelector('#temp_max').textContent = '| H:' + temp_max + symbol;
			
			let pressure = response.main.pressure;
			if (pressure ==="")
				document.querySelector('#pressure').textContent = "N.A.";
			else
				document.querySelector('#pressure').textContent =  pressure + pressureUnits;
			
			let humidity = response.main.humidity;
			if (humidity ==="")	
				 document.querySelector('#humidity').textContent = "N.A.";
			 else
				document.querySelector('#humidity').textContent = humidity + " %";
			
			let windSpeed = response.wind.speed;
			if (windSpeed ==="")
				 document.querySelector('#windSpeed').textContent = "N.A.";
			 else
				document.querySelector('#windSpeed').textContent = windSpeed + windSpeedUnits;
			
			let cloudCover = response.clouds.all;
			if (cloudCover ==="")
				 document.querySelector('#cloudsCover').textContent = "N.A.";
			else
				document.querySelector('#cloudsCover').textContent = cloudCover + "%";
			
			let sunrise = response.sys.sunrise;
			if (sunrise ===""){ 
				document.querySelector('#sunrise').textContent = "N.A.";
			}else {
				let d = new Date(sunrise * 1000);
				let h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
				let m = "0" + d.getSeconds();
				document.querySelector('#sunrise').textContent = h + ":" + m.substr(-2);
			}
			
			let sunset = response.sys.sunset;
			if (sunset ===""){ 
				document.querySelector('#sunset').textContent = "N.A.";
			}else {	
				d = new Date(sunset * 1000);
				h =  d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
				m = "0" + d.getSeconds();
				document.querySelector('#sunset').textContent = h + ":" + m.substr(-2);
			}
		}
	};
	
	xhr.open('GET',"https://api.openweathermap.org/data/2.5/weather?lat="+ lat + "&lon=" + lon + "&units=" + type + "&APPID=1b2b3a82a8e633366caef05c1f70bcb2", true);
	xhr.send();
	
}

function forecastSearch(lat, lon, units) {
	let type;
   let symbol;
   let windSpeedUnits;
   let pressureUnits;

	if (units === 'metric') {
      type = 'metric';
      symbol = ' °C';
      windSpeedUnits = ' meters/sec';
      pressureUnits = ' hPa';
   } else {
      type = 'imperial'
      symbol = ' °F';
      windSpeedUnits = ' miles/hour';
      pressureUnits = ' Mb';
   }

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		  
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () { 
		if (xhr.readyState !== 4) return;
		if (xhr.status >= 200 && xhr.status < 300) { 
			const response = JSON.parse(this.responseText);
			let date; let hours; let minutes;let icon; let element;let cloudCover;let modalHeader;
         for (i = 1; i <= 8; i++) {
				
            date = new Date(response.list[i - 1].dt * 1000);
            hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            minutes = "0" + date.getMinutes();
				document.querySelector('#time' + i).textContent = hours + ":" + minutes.substr(-2);

            icon = response.list[i - 1].weather[0].icon;
            element = document.querySelector('#summary' + i);
            element.src = "http://openweathermap.org/img/w/" + icon + ".png";
				
				temp = response.list[i - 1].main.temp;
				document.querySelector('#temp' + i).textContent = temp + symbol;
				
				cloudCover = response.list[i - 1].clouds.all
				document.querySelector('#cloudcover' + i).textContent = cloudCover + "%";
				
				modalHeader = "Weather in " + response.city.name + " on " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + " " + hours + ":" + minutes.substr(-2);
				document.querySelector("#viewheader"+ i).textContent = modalHeader;
				
				document.querySelector("#view" + i +"icon").src = "http://openweathermap.org/img/w/" + icon + ".png";
				
				document.querySelector("#view" + i +"description").textContent = response.list[i - 1].weather[0].main + " (" +response.list[i - 1].weather[0].description + ")";
				
				document.querySelector("#view" + i +"Humidity").textContent = response.list[i - 1].main.humidity + "%";
				
				document.querySelector("#view" + i +"Pressure").textContent = response.list[i - 1].main.pressure + pressureUnits;
				
				document.querySelector("#view" + i +"WindSpeed").textContent = response.list[i - 1].wind.speed + windSpeedUnits;
			}
		}
	};
	
	xhr.open('GET','http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=' + type + "&APPID=1b2b3a82a8e633366caef05c1f70bcb2", true);
	xhr.send();	
	
}

function mapAndLayers (lat, lon) {
	document.getElementById("map").innerHTML = "";
	var map = new ol.Map({ // a map object is created
		target: 'map', // the id of the div in html to contain the map
		layers: [ // list of layers available in the map
			new ol.layer.Tile({ // first and only layer is the OpenStreetMap tiled layer
				source: new ol.source.OSM()
			})
		],
		view: new ol.View({ // view allows to specify center, resolution, rotation of the map
			center: ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]), // center of the map
			zoom: 5 // zoom level (0 = zoomed out)
		})
	});
	
	layer_temp = new ol.layer.Tile({
		source: new ol.source.XYZ({ 
			url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=1b2b3a82a8e633366caef05c1f70bcb2',
		}) 
	});
	map.addLayer(layer_temp);
	
	precipitation_temp = new ol.layer.Tile({
		source: new ol.source.XYZ({ 
			url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=1b2b3a82a8e633366caef05c1f70bcb2',
		}) 
	});
	map.addLayer(precipitation_temp);
	//map.updateSize()
}
