// Fonction pour ajouter une tâche à partir de la page WEB
function addTask() {

	//Si on appelle cette fonction, alors on récupère le corps de la zone de saisie de texte et on ajoute la tâche à la base de données.
	
	// On récupère le libellé de la tâche à ajouter
	data = document.getElementById("newtodo").value

	// On construit le corps JSON tel que notre route POST le demande, avec id qui prendra la valeur maximale + 1 de tous les identifiants de nos tâches
	donnee = {"values": [{"id": getNumberTask() + 1, "libelle": data, "status": "A_FAIRE"}]}

	// On appelle l'API fetch afin de réaliser un POST sur notre route précédemment créée pour ajouter une tâche à la base de données
	fetch("/taches", {
		
		// On indique que la requête est en format JSON
		headers: {
 			'Accept': 'application/json',
 			'Content-Type': 'application/json'
 		},
 		// On indique que on veut une méthode POST
 		method: 'post',
 		// On renseigne le corps de la requête avec notre donnée
 		body: JSON.stringify(donnee)
 		// Une fois la requête terminée, on rafraichi la page pour afficher instantanément la nouvelle tâche
	}).then((response) => {
			document.location.reload()
		})
}

// Fonction pour compter le nombre de tâches affichés sur la page WEB
function getNumberTask() {

	// Il y a un élement de classe "supprimer" par tâche, il suffit alors de les compter
	return document.getElementsByClassName("supprimer").length
}

// Fonction pour modifier l'état d'une tâche dans la base de données
// On récupère en paramètre la checkbox qui a déclenché l'action
function modifyState(Checkbox){

	// On récupère l'identifiant de la tâche associée à la checkbox, sous l'attribut "data-id"
	id = Checkbox.parentElement.getAttribute("data-id")

	// On récupère le libelle de la tâche associé à l'id récupéré
	// Il s'agit du texte de chaque <p> avec l'attribut id
	libelle = document.getElementById(id).innerHTML

	// On vérifie l'état de la checkbox
	if(Checkbox.checked){

		// Si elle est cochée, c'est que la tâche doit être marquée comme faite
		status = "FAIT"

	}
	else{

		// Sinon, c'est que la tâche doit être marquée comme à faire
		status = "A_FAIRE"

	}

	// Alors on crée le corps JSON tel que notre route PUT le demande pour modifier la tâche
	donnee = {"values": [{"id": id, "libelle": libelle, "status": status}]}

	// On appelle l'API fetch afin de réaliser un PUT sur notre route précédemment créée pour modifier une tâche de la base de données
	fetch("/taches/" + id, {
	
		// On indique que la requête est en format JSON
		headers: {
 			'Accept': 'application/json',
 			'Content-Type': 'application/json'
 		},
 		// On indique que on veut une méthode PUT
 		method: 'put',
 		// On renseigne le corps de la requête avec notre donnée
 		body: JSON.stringify(donnee)
 		// Une fois la requête terminée, on rafraichi la page pour modifier instantanément la tâche
	}).then((response) => {
			document.location.reload()
		})
}

// Fonction pour supprimer une tâche dans la base de données via la croix
// On récupère en paramètre la croix qui a déclenché l'action
function deleteTask(Span) {

	// On récupère l'identifiant de la tâche associée à la croix
	id = Span.getAttribute("id")

	// On appelle l'API fetch afin de réaliser un DELETE sur notre route précédemment créée pour supprimer la tâche d'identifiant id de la base de données
	fetch("/taches/" + id, {
	
		// On indique que la requête est en format JSON
		headers: {
 			'Accept': 'application/json',
 			'Content-Type': 'application/json'
 		},
 		// On indique que on veut une méthode DELETE
 		method: 'delete',
 		// On donne un corps vide à la requête
 		body: ""
 		// Une fois la requête terminée, on rafraichi la page pour supprimer instantanément la tâche de la page
	}).then((response) => {
			document.location.reload()
		})
}