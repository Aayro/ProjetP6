/* Import des modules necessaires */

const Sauce = require("../models/sauce");
const fs = require('fs');
const sauce = require("../models/sauce");


/* Controleur creation sauce */
exports.createSauce = (req, res, next) => {

    const sauceObject = JSON.parse(req.body.sauce);

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
            }`,
        // Initialisation valeur like-dislike 0
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });

    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
        .catch((error) => res.status(400).json({ error }));
};

/* Controleur recuperation all sauces */
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

/* Controleur recuperation 1 sauce */
exports.getOneSauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({
        _id: req.params.id,
    })
        // Affichage sauce
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

/* Controleur modification sauce */
exports.modifySauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Enregistrement ancienne imgUrl (si nouvelle image dans modif)
            const oldUrl = sauce.imageUrl;
            // Recuperation du nom de l'image
            const filename = sauce.imageUrl.split("/images/")[1];
            // Suppression image dans le dossier local
            if (req.file) {
                fs.unlink(`images/${filename}`, () => {
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                            }`,
                    };
                    // MAJ de la sauce avec données modifiées
                    Sauce.updateOne(
                        { _id: req.params.id },
                        { ...sauceObject, _id: req.params.id }
                    )
                        .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                        .catch((error) => res.status(400).json({ error }));
                });
                // Modification sauce sans modif img
            } else {
                const newItem = req.body;
                newItem.imageUrl = oldUrl;
                // MAJ de la sauce avec données modifiées
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...newItem, imageUrl: oldUrl, _id: req.params.id }
                )
                    .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

/* Controleur suppression sauce */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(Sauce => {
            const filename = Sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

/* Controleur like dislike */
exports.likeDislikeSauce = (req, res, next) => {
    let likeDislike = parseInt(req.body.like);
    Sauce.findOne({
        // id de la sauce
        _id: req.params.id,
    })
        .then((sauce) => {
            // Si sauce like = 1
            if (likeDislike === 1) {
                sauce.likes++;
                // sauvegarde userId pour savoir si il a voté
                sauce.usersLiked.push(req.body.userId);
                // MAJ de la sauce avec données modifiées
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        likes: sauce.likes,
                        usersLiked: sauce.usersLiked,
                        _id: req.params.id,
                    }
                )
                    .then(() => res.status(200).json({ message: "Tu like ce produit !" }))
                    .catch((error) => res.status(400).json({ error }));
                // Si sauce dislike = -1
            } else if (likeDislike === -1) {
                sauce.dislikes++;
                // sauvegarde userId pour savoir si il a voté
                sauce.usersDisliked.push(req.body.userId);
                // MAJ de la sauce avec données modifiées
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        dislikes: sauce.dislikes,
                        usersDisliked: sauce.usersDisliked,
                        _id: req.params.id,
                    }
                )
                    .then(() => res.status(200).json({ message: "Tu dislike ce produit !" }))
                    .catch((error) => res.status(400).json({ error }));
            }
            else if (likeDislike === 0) {

                if (sauce.usersLiked.includes(req.body.userId)) {

                    sauce.likes--;

                    const index = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersLiked.splice(index, 1);

                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            likes: sauce.likes,
                            usersLiked: sauce.usersLiked,
                            _id: req.params.id,
                        }
                    )
                        .then(() =>
                            res.status(200).json({ message: "Tu ne like plus ce produit !" })
                        )
                        .catch((error) => res.status(400).json({ error }));

                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.dislikes--;

                    const index = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(index, 1);

                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            dislikes: sauce.dislikes,
                            usersDisliked: sauce.usersDisliked,
                            _id: req.params.id,
                        }
                    )
                        .then(() =>
                            res.status(200).json({ message: "Tu ne dislike plus ce produit !" })
                        )
                        .catch((error) => res.status(400).json({ error }));
                }

            }
        })
};