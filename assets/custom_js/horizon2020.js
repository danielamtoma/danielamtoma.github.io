// Pour la carte
var map = L.map( 'map', {
  center: [46.519962, 6.633597],
  minZoom: 2,
  zoom: 5
});

L.tileLayer( 'http://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
 subdomains: ['a','b','c']
}).addTo( map );


var myURL = jQuery( 'script[src$="horizon2020.js"]' ).attr( 'src' ).replace( 'horizon2020.js', '' );

var myIcon = L.icon({
  iconUrl: myURL + '../img/company24.png',
  iconRetinaUrl: myURL + '../img/company48.png',
  iconSize: [24, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
});

var countries = ["United Kingdom", "Finland", "Italy", "Spain", "France", "Germany", "Turkey", "Netherlands", "Norway", "Slovenia", "United States", "Belgium", "Lithuania", "Bulgaria",
                "Czech Republic", "Australia", "Hungary", "Serbia", "Israel", "Romania", "Poland", "Estonia", "Portugal", "Greece", "Switzerland", "Iceland", "China", "Sweden", "Austria",
                "Latvia", "South Africa", "Denmark", "Brazil", "Tunisia", "Ireland", "Palestinian Territory, Occupied", "Argentina", "Nigeria", "Cyprus", "Luxembourg", "India", "Colombia",
                "Croatia", "Egypt", "Moldova", "Jamaica", "Macedonia", "Canada", "Mexico", "Gabon", "Russian Federation", "Slovakia", "Ukraine", "Liechtenstein", "Ethiopia", "New Zealand",
                "Bosnia and Herzegovina", "Cameroon", "Japan", "Georgia", "Peru", "Grenada", "Armenia", "Montenegro", "Cote D'Ivoire", "Thailand", "Sri Lanka", "Malta", "Zambia", "Kazakhstan",
                "Kenya", "Kosovo", "Senegal", "Belarus", "Korea (South)", "Faroe Islands", "Burkina Faso", "Morocco", "Benin", "Ghana", "Mozambique", "Tanzania", "Albania", "Uruguay", "Botswana",
                "Afghanistan", "Chile", "Singapore", "Malaysia", "Jordan", "Algeria", "Cambodia", "Swaziland", "Costa Rica", "Yemen", "Togo", "Taiwan", "New Caledonia", "Uganda", "Viet Nam",
                "Indonesia", "Guatemala", "Bangladesh", "United Arab Emirates", "Iraq", "Mali", "Namibia", "Hong Kong", "Rwanda", "Azerbaijan", "Malawi", "Lebanon", "Jersey", "Ecuador", "Bolivia",
                "Seychelles", "Cuba", "Gibraltar", "Nepal", "Virgin Islands, British", "Greenland", "Madagascar", "Kyrgyzstan", "Philippines", "Mauritius", "Tajikistan", "Anguilla",
                "French Polynesia", "Turkmenistan", "KO", "Pakistan", "Iran", "Venezuela", "Qatar", "Uzbekistan", "Nicaragua", "Mauritania", "Cape Verde", "Mongolia", "Angola", "Niger",
                "Syrian Arab Republic", "Liberia", "Laos", "Libyan Arab Jamahiriya", "Burundi"]

var markerClusters = {};

// creation d'un cluster par pays
for ( var j = 0; j < countries.length; ++j ){
  country = countries[j];
  markerClusters[country] = L.markerClusterGroup({
  	showCoverageOnHover: false
  });
}
//var markerClusters = L.markerClusterGroup();

var searchQuery = {
  search: '',
  slider: [],
  sector: []
}

// Pour la recherche
// Champ de recherche
function mapSearchField(champ){
  recherche = champ.toLowerCase();
  searchQuery.search = recherche;
  mapSearch();
}

// Slider pour les contributions
function mapSlider(min, max){
  var value = [0, 500000, 1000000, 1000000, 50000000, 100000000, 1000000000];
  if(min != max){
    searchQuery.slider = [value[min], value[max]];
  }
  mapSearch();
}

// Selecteur pour les secteurs
function sectorSel(){
  var id = $('#sectorSelector').text();
  searchQuery.sector = id.split(",");
  mapSearch();
}

// Pour les selecteurs
function mapSearch(){
  // supprime tous les markers avant de les recréer
  for (var cluster in markerClusters){
    markerClusters[cluster].clearLayers();
  }

  var euContribution = 0;

  var sectorStat = {
    PRC: 0,
    REC: 0,
    HES: 0,
    PUB: 0,
    OTH: 0
  };

  for ( var i = 0; i < markers.length; ++i ){
    // SELECTORS
    // selecteur contribution EU
    if (markers[i].orgEcContr >= searchQuery.slider[0] && markers[i].orgEcContr <= searchQuery.slider[1]){

      // Pour rechercher les secteurs sélectionnés
      if(searchQuery.sector.length > 0){
        var sectorFound = searchQuery.sector.includes(markers[i].orgSector);
        if(sectorFound == true){
          if(searchQuery.search.length > 0){
            // Pour rechercher si le champ de recherche est contenu dans le nom de la compagnie
            var compagnie_name = markers[i].orgName.toLowerCase();
            if(compagnie_name.includes(searchQuery.search)){

              euContribution += markers[i].orgEcContr;
              ++sectorStat[markers[i].orgSector];
              // Clustering by countries
              var popup = markers[i].orgName +
                          '<br/><b>Secteur:</b> ' + markers[i].orgSector +
                          '<br/><b>Contribution EU:</b> ' + markers[i].orgEcContr + ' €';

              var m = L.marker( [markers[i].orgLat, markers[i].orgLng], {icon: myIcon, id:markers[i].orgId, name:markers[i].orgName})
                              .bindPopup( popup ).on('click', writeCompanyId);

              country = markers[i].orgCountry;
              markerClusters[country].addLayer( m );
            }
          // S'il n'y a pas de termes à rechercher
          } else {
            euContribution += markers[i].orgEcContr;
            ++sectorStat[markers[i].orgSector];
            // Clustering by countries
            var popup = markers[i].orgName +
                        '<br/><b>Secteur:</b> ' + markers[i].orgSector +
                        '<br/><b>Contribution EU:</b> ' + markers[i].orgEcContr + ' €';

            var m = L.marker( [markers[i].orgLat, markers[i].orgLng], {icon: myIcon, id:markers[i].orgId, name:markers[i].orgName})
                            .bindPopup( popup ).on('click', writeCompanyId);

            country = markers[i].orgCountry;
            markerClusters[country].addLayer( m );
          }
        }
      }
    }
  }

  for (var cluster in markerClusters){
    map.addLayer( markerClusters[cluster] );
  }
  $("#mySelectorTitle").html('Contribution EU: '+euContribution.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €');
  $('#spinner').hide();

  $.getScript('assets/custom_js/selector_barchart.js', function() {
    selectorBarchart(sectorStat);
  });
}


//Fonction qui va écrire l'id de la compganie dans la div #companyId
function writeCompanyId(e){
  $("#companyId").html(e.target.options.id);
  companyId(e.target.options.name);
}

/****** FONCTION RECUPERATION ID Compagnies ******/
function companyId(name) {
  $("#myCompanyTitle").html('');
  $("#myCompanyTitle").html('<img src="assets/img/company24.png" alt="Company" />'+name);
  // Pour afficher les données des compagnies dans un tableau
  $.getScript('assets/custom_js/company_tableau.js', function() {
    companyInformation();
  });

  // Pour appeler la fonction qui affiche le dendrogame des compagnies
  $.getScript('assets/custom_js/company_tree.js', function() {
    companyRelations();
  });

  // Pour appeler la fonction qui affiche les donuts de coûts
  $.getScript('assets/custom_js/company_contributions.js', function() {
    companyContribution();
  });

  // Pour appeler la fonction qui affiche les donuts de proportion
  $.getScript('assets/custom_js/company_contributions_2.js', function() {
    companyContributionProportion();
  });

  // Pour appeler la fonction qui affiche les graphs des projets
  $.getScript('assets/custom_js/company_relation_projects.js', function() {
    companyRelationProjects();
  });
}

/****** FONCTION RECUPERATION ID Projets ******/
function projectId(name) {
  $("#myProjectTitle").html('');
  $("#myProjectTitle").html('<img src="assets/img/project24.png" alt="Projet" />'+name);
  // Pour afficher les données des projets dans un tableau
  $.getScript('assets/custom_js/project_description.js', function() {
    projectInformation();
  });

  // Pour appeler la fonction qui affiche le tableau des contributions
  $.getScript('assets/custom_js/project_tableau.js', function() {
    projectTableau();
  });

  // Pour appeler la fonction qui affiche les proportions des donuts
  $.getScript('assets/custom_js/project_contributions.js', function() {
    projectContribution();
  });

  // Pour appeler la fonction qui affiche les proportions des donuts
  $.getScript('assets/custom_js/project_contributions_2.js', function() {
    projectContributionProportion();
  });

  // Pour appeler la fonction qui affiche les graphs sur les relations du projet
  $.getScript('assets/custom_js/project_relation_companies.js', function() {
    projectRelationCompanies();
  });


}
