// On importe les fonctionnalités utiles à notre programme
let db = require("./db")
let express = require("express")()
let body = require("body-parser")

// On donne à ExpressJS les outils pour décoder du JSON et des URL
express.use(body.json())
express.use(body.urlencoded())

// Route pour le fichier de script de la page
express.get("/fetch.js", (request, response) =>{

	// Si on demande cette route, on renvoi le fichier de script avec le content-type text/javascript pour bien indiquer au navigateur qu'il s'agit de javascript.
	response.set("Content-Type", "text/javascript")
	response.sendFile(__dirname + "/fetch.js")
})

// Route pour le fichier de CSS de la page
express.get("/views/style.css", (request, response) =>{

	// Si on demande cette route, on renvoi le fichier de CSS avec le content-type text/css pour bien indiquer au navigateur qu'il s'agit de CSS.
	response.set("Content-Type", "text/css")
	response.sendFile(__dirname + "/views/style.css")
})

// Route pour l'affichage de la page
express.get("/", (request, response) => {

	// Si cette route est demandé, alors on commence par interroger la base de données pour récupérer l'ensemble des tâches à faire
	db.then( pool =>

		pool.query('SELECT * from taches')

	// Puis on envoie le résultat au fichier index.ejs qui se charge du rendu pour l'utilisateur
	).then( results => { 

		response.render('index.ejs', {todolist: results});

	}) ;
});

// Route pour l'ajout d'une tâche
express.post("/taches", (request, response) => {

	// Si cette route est demandé, alors on récupère le corps de la requête et on ajoute la tâche à la base de données. Le corps doit avoir le format suivant :
	// Body format : {"values": [{"id": 4, "libelle": "GET", "status": "A_FAIRE"}]}

	// On récupère le corps dans une variable
	var values = request.body.values

	// On crée un tableau avec nos valeurs à ajouter dans la base de données
	values = [[values[0].id, values[0].libelle, values[0].status]]

	// On crée la requête SQL avec les points d'interogation pour éviter le XSS
	sql = "INSERT INTO taches (id, libelle, status) VALUES ?"

	// Enfin, on envoie la requête à la base de données
	db.then(pool => pool.query(sql, [values], (error, results) => {

		// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
		if (error) {
			response.statusCode = 400
			response.send(error)
		}
		else{

			// Sinon, on peut lui renvoyer un code 201 avec l'emplacement de la tâche créée
			response.status(201);
			response.location("/taches/"+results.insertId)
			response.send(null);
		}

	}))
})

// Route pour l'affichage de l'ensemble des tâches de la base de données
express.get("/taches", (request, response) => {

	// Si cette route est demandé, alors on demande à la base de données de nous retourner l'ensemble des tâches de la base de données
	db.then( pool => {
	
				pool.query(("SELECT * FROM taches"), (error, results) => {

				// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
				if (error){

					response.statusCode = 404
					response.send(error)

				}
				else{

					// Sinon, on peut lui renvoyer un code 201 avec le résultat de la requête au format JSON
					response.statusCode = 200
		 			response.json(results)

				}
					

			})
				
	})
})

// Route pour l'affichage d'une tâche de la base de données
express.get("/taches/:id", (request, response) =>{

	// Si cette route est demandé, alors on interroge la base de données pour récupérer la tâche avec l'identifiant renseigné dans l'URL
	db.then( pool => {
				
				// On construit encore une fois la requête avec un point d'interrogation pour éviter les attaques XSS
				pool.query("SELECT * FROM taches WHERE id = ?", request.params.id, (error, results) => {

				// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
				if (error){

					response.statusCode = 404
					response.send(error)

				}
				else{

					// Sinon, on peut lui renvoyer un code 201 avec le résultat de la requête au format JSON
					response.statusCode = 200
		 			response.json(results)

				}
					

			})
				
	})
})

// Route pour supprimer une tâche de la base de données
express.delete("/taches/:id", (request, response) =>{

	// Si cette route est demandé, alors on demande à la base de données de supprimer la tâche avec l'identifiant renseigné dans l'URL
	db.then( pool => {
			
				// On construit encore une fois la requête avec un point d'interrogation pour éviter les attaques XSS
				pool.query("DELETE FROM taches WHERE id = ?", request.params.id, (error, results) => {

					// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
					if (error){

						response.statusCode = 404
						response.send(error)

					}
					else{

						// Sinon, on dit également à la base de données de mettre à jour les identifiants des tâches dans le but d'obtenir une suite continu
						// Cela permet de simplifier l'affichage. En effet, s'il manque un identifiant dans la liste, on peut obtenir des problèmes
						sql = "UPDATE taches SET id = id - 1 WHERE id > ?"
						db.then(pool => pool.query(sql, request.params.id, (error, res) => {

							// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
							if (error) {
								response.statusCode = 400
								response.send(error)
							}
							else {

								// Sinon, on peut renvoyer le code 200 pour indiquer que la requête s'est correctement déroulée
								response.statusCode = 200
								response.send(null);
							}

						}))
					}	
			})
	})
})

// Route pour mettre à jour une tâche de la base de données
express.put("/taches/:id", (request, response) => {

	// Si cette route est demandé, alors on récupère le corps de la requête et on modifie la tâche associé à l'identifiant donnée dans l'URL. Le corps doit avoir le format suivant :
	// Body format : {"values": [{"libelle": "GET", "status": "A_FAIRE"}]}

	// On récupère le corps dans une variable
	var values = request.body.values

	// On crée un tableau avec nos valeurs à ajouter dans la base de données
	values = [values[0].libelle, values[0].status, request.params.id]

	// On crée la requête SQL avec les points d'interogation pour éviter le XSS
	sql = "UPDATE taches SET libelle = ?, status = ? WHERE id = ?"

	// Enfin, on envoie la requête à la base de données
	db.then(pool => pool.query(sql, values, (error, results) => {

		// Si la requête renvoi une erreur, on la renvoi à l'utilisateur
		if (error) {
			response.statusCode = 400
			response.send(error)
		}

		// Sinon, on peut renvoyer le code 200 pour indiquer que la requête s'est correctement déroulée
	})).then(result => {

			response.statusCode = 200
			response.send(null);

		})
})

// On indique à ExpressJS d'écouter sur le port 8080
express.listen(8080)