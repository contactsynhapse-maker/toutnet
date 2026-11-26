/* =====================================================================
   TOUT'NET — CONFIGURATION DU SITE
   ---------------------------------------------------------------------
   Tout le contenu du site est défini dans ce fichier : textes, tarifs,
   formules, options, packs, coordonnées, photos, réservation.

   Les informations proviennent du flyer « Formules Tout'Net ».
   Les éléments marqués  // À DÉFINIR  attendent une validation : tant
   qu'ils sont vides, le site les masque ou affiche un emplacement neutre.

   ⚠ Les prix sont des NOMBRES (90, pas "90 €"). Les identifiants `id`
   ne doivent pas être modifiés une fois la réservation en ligne active
   (ils servent au calcul des durées côté Google, onglet « Durées »).
   ===================================================================== */

window.SITE_CONFIG = {

  /* Soulignage en pointillés des contenus encore provisoires.
     Passer à `false` quand tout sera rempli. */
  afficherReperes: false,

  /* ------------------------------------------------------------------
     IDENTITÉ
     ------------------------------------------------------------------ */
  identite: {
    nom: "Tout'Net",
    logo: "assets/logo-embleme.png",
    logoComplet: "assets/logo.png",
    badge: "Nettoyage de véhicules · Mobile",
    accroche: "Service de nettoyage",
    sousAccroche: "Un intérieur de véhicule impeccable, sans vous déplacer.",
    slogan: "Tout'Net reste à votre service, car ce qui compte, c'est la propreté.",
  },

  /* ------------------------------------------------------------------
     COORDONNÉES
     Téléphone / WhatsApp : format international sans espaces ni « + ».
     Chaque moyen renseigné génère automatiquement un bouton.
     ------------------------------------------------------------------ */
  contact: {
    telephone: "33647590673",
    telephoneAffiche: "06 47 59 06 73",
    whatsapp: "33647590673",  // À CONFIRMER — même numéro que le téléphone ?
    email: "tout.net81@gmail.com",
    instagram: "tout.net81",
    zone: "À domicile ou à l'atelier de Lavaur",
    horaires: "",             // À DÉFINIR (facultatif)
  },

  /* ------------------------------------------------------------------
     PRÉSENTATION DU PRESTATAIRE
     Section masquée tant que `texte` est vide.
     ------------------------------------------------------------------ */
  presentation: {
    titre: "Qui suis-je ?",
    texte: "",   // À DÉFINIR — quelques lignes de présentation de Quentin
    photo: "",   // À DÉFINIR — ex. "assets/photos/quentin.jpg"
  },

  /* ------------------------------------------------------------------
     AVANTAGES (bandeau sous l'accueil)
     Icônes : mobile, formules, remise, calendrier, goutte, etoile
     ------------------------------------------------------------------ */
  avantages: [
    { icone: "mobile",     titre: "À domicile ou à l'atelier", texte: "Chez vous, sur votre lieu de travail ou à l'atelier de Lavaur : vous choisissez." },
    { icone: "formules",   titre: "Nettoyage complet",    texte: "Aspiration, plastiques, vitres et shampouinage des sièges par extraction." },
    { icone: "remise",     titre: "Tarifs dégressifs",    texte: "−10 % de 2 à 4 véhicules, −15 % à partir de 5." },
    { icone: "calendrier", titre: "Réservation en ligne", texte: "Composez votre formule et choisissez votre créneau en quelques clics." },
  ],

  /* ------------------------------------------------------------------
     TYPES DE VÉHICULES & PRIX (nets, TVA non applicable)
     prixMin / prixMax : fourchette affichée dans « Tarifs » (flyer).
     image : photo affichée sous le nom (assets/vehicules/…), facultative.
     prix : prix de la prestation pour ce véhicule (clé "formule-2",
            seule prestation proposée depuis le 26/11/2026). Les options
            s'ajoutent ensuite.
     devis: true : pas de prix affiché, « Prix sur devis ».
     ------------------------------------------------------------------ */
  vehicules: [
    { id: "citadine",   nom: "Citadine",            image: "assets/vehicules/citadine.jpg",  prixMin: 125, prixMax: 125, prix: { "formule-2": 125 } },
    { id: "break-suv",  nom: "Berline · SUV",       image: "assets/vehicules/break-suv.jpg", prixMin: 140, prixMax: 140, prix: { "formule-2": 140 } },
    { id: "7-places",   nom: "7 places (van)",      image: "assets/vehicules/7-places.jpg",  prixMin: 155, prixMax: 155, prix: { "formule-2": 155 } },
    { id: "commercial", nom: "Voiture commerciale", image: "assets/vehicules/commercial.jpg", devis: true },   // À DÉFINIR — prix
  ],

  /* ------------------------------------------------------------------
     PRESTATION (une seule depuis le 26/11/2026, décision de Quentin)
     L'ancienne « Formule 1 · Aspiration à sec » est retirée ; son contenu
     est inclus dans la prestation ci-dessous.
     ------------------------------------------------------------------ */
  formules: [
    {
      id: "formule-2",   // ne pas changer : identifiant utilisé par la réservation (onglet « Durées »)
      etiquette: "Nettoyage intérieur",
      nom: "Nettoyage complet par extraction",
      sousTitre: "Pour un intérieur impeccable, en profondeur",
      duree: "Environ 3 h",
      accroche: "La shampouineuse injecte puis aspire l'eau dans les tissus et extrait la saleté incrustée, là où un simple aspirateur ne va pas.",
      inclus: [
        "Aspiration complète de l'habitacle : sièges, tapis et moquettes",
        "Nettoyage et aspiration du coffre",
        "Dépoussiérage de tous les plastiques : tableau de bord, écran, panneaux de porte, vide-poches",
        "Dégraissage des vitres et du pare-brise",
        "Nettoyage des contours de portières",
        "Shampouinage des sièges par extraction",
      ],
      miseEnAvant: true,
    },
  ],

  /* ------------------------------------------------------------------
     OPTIONS (cases à cocher, par véhicule)
     `groupe` (facultatif) : une seule option du même groupe peut être cochée.
     ------------------------------------------------------------------ */
  options: [
    { id: "vehicule-tres-sale", nom: "Véhicule très sale", prix: 30, description: "Supplément indicatif, ajusté sur place selon l'état réel." },
    { id: "poils-animaux",      nom: "Beaucoup de poils d'animaux", prix: 20, description: "Supplément pour les véhicules de nos compagnons à poils." },
  ],

  /* ------------------------------------------------------------------
     ÉTAT DU VÉHICULE — question séparée (non utilisée : l'état est
     proposé en option « Véhicule sale / très sale »).
     ------------------------------------------------------------------ */
  niveaux: [],

  /* ESTIMATION affichée au client, pour chaque véhicule :
       prix de la formule choisie (vehicules[].prix) + options cochées,
     puis remise pack éventuelle. Les frais de déplacement ne sont
     jamais affichés au client. */

  /* ------------------------------------------------------------------
     PACKS (remise selon le nombre de véhicules d'une même réservation)
     `appliquer: false` = affiché dans les tarifs mais PAS déduit de
     l'estimation (remise décidée au cas par cas, sur la facture).
     ------------------------------------------------------------------ */
  packs: [
    { nom: "Famille",           remise: 10, min: 2, max: 4, description: "2 à 4 véhicules",        appliquer: true },
    { nom: "Flotte entreprise", remise: 15, min: 5,         description: "À partir de 5 véhicules", appliquer: true },
  ],

  /* ------------------------------------------------------------------
     SECTION « À DOMICILE OU À L'ATELIER »
     Les deux cartes affichées viennent de reservation.lieux (plus bas).
     ------------------------------------------------------------------ */
  sectionLieux: {
    titre: "Chez vous ou à l'atelier",
    intro: "Deux façons de faire nettoyer l'intérieur de votre véhicule : Quentin vient à vous, ou vous l'amenez à l'atelier de Lavaur.",
  },

  /* ------------------------------------------------------------------
     GALERIE AVANT / APRÈS
     Format : { titre: "", avant: "assets/photos/xxx-avant.jpg", apres: "assets/photos/xxx-apres.jpg" }
     Les deux photos doivent avoir exactement le même cadrage et la même
     taille (elles sont superposées). Le format (portrait / paysage) est
     détecté automatiquement.
     ------------------------------------------------------------------ */
  galerie: [
    { titre: "Banquette arrière", description: "Véhicule d'un particulier qui transporte régulièrement ses deux golden retrievers.", avant: "assets/photos/banquette-avant.jpg", apres: "assets/photos/banquette-apres.jpg" },
    { titre: "Coffre",            description: "Mercedes Classe E après un transport de végétaux.",                                   avant: "assets/photos/coffre-avant.jpg",    apres: "assets/photos/coffre-apres.jpg" },
  ],

  /* ------------------------------------------------------------------
     RÉSERVATION
     ------------------------------------------------------------------ */
  reservation: {
    // Lieu de la prestation : premier choix du parcours de réservation.
    // Pour l'atelier, l'adresse ci-dessous est utilisée à la place de celle
    // du client (calcul des créneaux, agenda, e-mails).
    lieux: [
      { id: "domicile", icone: "domicile", nom: "À domicile",
        description: "Chez vous ou sur votre lieu de travail : Toulouse, Albi, Castres, Gaillac, Lacaune.",
        accroche: "Quentin vient chez vous ou sur votre lieu de travail.",
        etiquetteVilles: "Déplacements", villes: ["Toulouse", "Albi", "Castres", "Gaillac", "Lacaune"],
        bouton: "Réserver à domicile" },
      { id: "atelier", icone: "atelier", nom: "À l'atelier",
        description: "Vous amenez votre véhicule à l'atelier Tout'Net, à Lavaur.",
        accroche: "Vous amenez votre véhicule à l'atelier Tout'Net.",
        etiquetteVilles: "Adresse", villes: ["Lavaur"],
        bouton: "Réserver à l'atelier",
        adresse: { rue: "Atelier Tout'Net", cp: "81500", ville: "Lavaur" } },   // À COMPLÉTER — adresse exacte de l'atelier
    ],

    // Adresse du service Google Apps Script (voir toutnet/reservation/GUIDE.md).
    // Tant qu'elle est vide, le site fonctionne en mode « demande » :
    // le client indique une date souhaitée et envoie sa demande par
    // e-mail / WhatsApp / SMS, sans réservation automatique.
    apiUrl: "https://script.google.com/macros/s/AKfycbyVCNiqCCCizPIZSSZzECPHeixDhsVzsU8yQijoQPBfDQrzUivJ86G1B5UaT-itEkTPqg/exec",

    maxVehicules: 10,

    // Texte affiché sous l'estimation de prix.
    mentionEstimation: "Prix estimé, net de TVA (TVA non applicable, art. 293 B du CGI). Les suppléments liés à l'état du véhicule sont confirmés sur place par Quentin.",

    // Aperçu : si apiUrl est vide et demo: true, des créneaux d'EXEMPLE
    // sont affichés et aucune demande n'est envoyée. Ignoré quand apiUrl
    // est renseignée.
    demo: false,

    // Durées d'intervention (minutes), utilisées pour afficher la durée
    // estimée tant que le service Google n'est pas installé. Une fois
    // installé, ce sont les durées de l'onglet « Durées » qui comptent.
    durees: {
      "citadine|formule-1": 120,   "citadine|formule-2": 180,
      "break-suv|formule-1": 120,  "break-suv|formule-2": 180,
      "7-places|formule-1": 120,   "7-places|formule-2": 180,   // À CONFIRMER
      "camion|formule-1": 180,     "camion|formule-2": 180,     // À CONFIRMER
      "utilitaire|formule-1": 180, "utilitaire|formule-2": 180,
      "commercial|formule-1": 90,  "commercial|formule-2": 120,
      "option|vehicule-tres-sale": 30,   // À CONFIRMER — temps en plus si très sale
    },
  },
};
