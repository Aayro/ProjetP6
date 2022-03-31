/* Import des modules necessaires */
const sauce = require("../models/sauce");
const Sauce = require("../models/sauce");


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
exports.modifySauce = (req, res, next) => { }

/* Controleur suppression sauce */
exports.deleteSauce = (req, res, next) => {
    const id = req.params.id;
    Sauce.findByIdAndDelete(id)
        .then((sauce) => { res.status(200).json(sauce); })
        .catch((error) => {
            res.status(500).json({
                error: error,
            });
        });
};

/* Controleur like dislike */
exports.likeDislikeSauce = (req, res, next) => { };