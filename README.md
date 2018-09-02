# Visualisation des données du programme H2020 de l’UE

## Contexte de développement :

Projet réalisé par **Daniela-Maria Toma** (Master en Humanités Numériques avec spécialisation Informatique pour les Sciences Humaines) dans le cadre du cours _Visualisation de données_ enseigné par **Isaac Pante** dans la _Faculté des Lettres_ de _l’Université de Lausanne_.

## Description :

Le projet offre une série de représentations dynamiques des données liées aux projets inscrits dans le programme Horizon 2020. Le site a été réalisé en html et javascript et les visualisations avec d3.js.

Le programme [Horizon 2020](https://ec.europa.eu/programmes/horizon2020/en/) (H2020) initié par l’Union Européenne représente le plus important programme de recherche et d'innovation de l'UE, avec près de 80 milliards d'euros de financement sur 7 ans (de 2014 à 2020). Les données liées à ce programme ont été mises à disposition du publique par l’UE et offrent des informations sur chaque projet inscrit, les organisations impliquées dans le projet, ainsi que les montants des subventions européennes conférés par projet et organisation.

Les [données](https://data.europa.eu/euodp/en/data/dataset/cordisH2020projects) du programme Horizon 2020 ont été utilisées dans ce projet afin de représenter les organisations, leurs relations avec d'autres entités, les projets ainsi que les coûts et les financements de l'Union Européenne.

La page est divisée en quatre zones principales :

### 1. Zone de représentation cartographique des entités impliquées dans des projets du programme H2020.

### 2. Zone de filtres pour la carte :
 - Filtre pour la contribution financière de l’UE
 - Filtre pour les secteurs affiliés aux projets
 - Barre de recherche par mots-clés
 
### 3. Zone liée à l’organisation choisie sur la carte, avec 4 menus :
 - **Menu Informations** : des informations générales sur l’organisation, une liste de ses projets et leurs coûts.
 - **Menu Relations** : une représentation de toutes les entités qui collaborent avec l'organisation sélectionnée.
 - **Menu Coûts** : une représentation des subventions reçues pour les 5  projets ayant reçu les plus grands financements de la part de l'Union Européenne.
 - **Menu Projets** : une représentation visuelle des projets de l'organisation.
 
### 4. Zone liée au projet choisi depuis la zone organisation, avec 4 menus :
- **Menu Informations** : des informations générales sur le projet et son coût.
- **Menu Compagnies** : une représentation de toutes les entités collaborant sur le projet.
- **Menu Coûts** : une représentation de la proportion subvention-coût total du projet.
- **Menu Tableau** : un tableau représentant les organisations qui participent au projet sélectionné.

Tous les éléments représentés - projets ou organisations - sont cliquables et les zones se mettent à jour dynamiquement afin de faciliter la navigation.


## Développement et outils employés :

Dans la phase de **prétraitement**, les données téléchargées ont été manipulées en _Python_ (suppression des données inutiles, formatage des données, génération des données utiles aux représentations).

Dans la phase de **développement**, le contenu de la page a été réalisé en utilisant les outils suivants :

**Langages** :
 - Javascript
 - Html
 
 **Ressources et librairies :**
 - d3.js v3
 - jquery
 - leaflet
 - bootstrap
 - ion.rangeslider
 - markercluster
 - keen-dashboards
 - font-awesome