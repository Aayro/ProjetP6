/* Import des modules necessaires */

const Sauce = require("../models/sauce");
const fs = require('fs');



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
                    console.log(req)
                    //{ _id: req.params.id, userId: req.body.userId },
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
    console.log(req)
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
// Regle likeDislikeSauce : Like = 1 _ Dislike = -1 _ Pas de vote = 0
exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            console.log(sauce)

            /* like d'une sauce */
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce liked !' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /*unlike d'une sauce */
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce unliked ' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* dislike d'une sauce */
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce disliked !' }))
                    .catch(error => res.status(400).json({ error }));
            }

            /* undislike d'une sauce */
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
                    .then(() => res.status(200).json({ message: 'sauce undisliked !' }))
                    .catch(error => res.status(400).json({ error }));
            }

        })
        .catch(error => res.status(500).json({ error }));


};
