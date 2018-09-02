/****** Fonction qui retourne les informations de la compagnie ******/
function projectTableau(){
  var id = $('#projectId').text();
  $.getJSON('data/projects/'+id+'.json', function(data){
    var compagnies = '<table class="table">'+
                  '<thead>'+
                  '<tr>'+
                  '<th scope="col">Id</th>'+
                  '<th scope="col" style="min-width: 200px">Compagnie</th>'+
                  '<th scope="col">Contribution EC</th>'+
                  '</tr>'+
                  '</thead>';

    for (var key in data.projectParticipants) {
        compagnies += '<tr>';
        // check if the property/key is defined in the object itself, not in parent
        if (data.projectParticipants.hasOwnProperty(key)) {
            compagnies += '<td>'
            compagnies += data.projectParticipants[key]['orgId']
            compagnies += '</td>'
            compagnies += '<td>'
            compagnies += '<p class="font-links-company-project" onclick="selectCompanyId(\''+data.projectParticipants[key]['orgId']+'\', \''+data.projectParticipants[key]['orgName']+'\')">'+data.projectParticipants[key]['orgName']+'</p>'
            compagnies += '</td>'
            compagnies += '<td>'
            compagnies += data.projectParticipants[key]['ecContrib'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
            compagnies += '</td>'
        }
        compagnies += '</tr>';
    }

    compagnies += '</table>';

    $("#myProjectGraph_4").html(
      '<br/><b>RCN:</b> ' + data.rcn +
      '<br/><b>Acronyme:</b> ' + data.acronym +
      '<br/><b>Titre:</b> ' + data.title +
      '<br/><b>Contribution EU:</b> ' + data.ecMaxContribution.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      '<br/>'+ compagnies +
      ''
    );
  });
}

/****** FONCTION RECUPERATION ID Projets ******/
function selectCompanyId(e, name) {
  $("#companyId").html(e);
  // Pour afficher les données des projets dans un tableau
  companyId(name);
}
