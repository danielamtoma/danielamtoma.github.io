/****** Fonction qui retourne les informations de la compagnie ******/
function companyInformation(){
  $("#myCompanyGraph_1").html('');
  $("#myCompanyGraph_1_description").html('');
  var id = $('#companyId').text();

  // Affichage des informations
  $.getJSON('data/companies/'+id+'.json', function(description){
    $("#myCompanyGraph_1_description").html(
      '<br/><b>ID:</b> ' + description.orgId +
      '<br/><b>Secteur:</b> ' + description.orgSector +
      '<br/><b>Organisation:</b> ' + description.orgName +
      '<br/><b>Contribution EU:</b> ' + description.orgEcContr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      ''
    );
  });

  $.getJSON('data/companies/'+id+'.json', function(data){
    var projets = '<table class="table">'+
                  '<thead>'+
                  '<tr>'+
                  '<th scope="col">RCN</th>'+
                  '<th scope="col" style="min-width: 200px">Projet</th>'+
                  '<th scope="col">Contribution EC</th>'+
                  '</tr>'+
                  '</thead>';

    for (var key in data.orgProjects) {
        projets += '<tr>';
        // check if the property/key is defined in the object itself, not in parent
        if (data.orgProjects.hasOwnProperty(key)) {
            projets += '<td>'
            projets += data.orgProjects[key]['rcn']
            projets += '</td>'
            projets += '<td>'
            projets += '<p class="font-links-company-project" onclick="selectProjectId(\''+data.orgProjects[key]['rcn']+'\', \''+data.orgProjects[key]['Acronym']+'\')">'+data.orgProjects[key]['Acronym']+'</p>'
            projets += '</td>'
            projets += '<td>'
            projets += data.orgProjects[key]['ecContrib'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
            projets += '</td>'
        }
        projets += '</tr>';
    }

    projets += '</table>';

    $("#myCompanyGraph_1").html(projets);
  });
}

/****** FONCTION RECUPERATION ID Projets ******/
function selectProjectId(e, name) {
  $("#projectId").html(e);
  // Pour afficher les données des projets dans un tableau
  projectId(name);
}
