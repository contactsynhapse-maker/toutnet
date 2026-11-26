/* =====================================================================
   TOUT'NET — DEMANDE DE DEVIS AVEC PHOTOS
   - Site.photoPicker() : sélection de photos (appareil photo ou galerie),
     réduites dans le navigateur (JPEG, 1600 px max) avant l'envoi.
   - Fenêtre « Demandez votre devis » : ouverte par tout élément
     [data-devis] (data-devis-vehicule, data-devis-formule facultatifs).
     L'envoi passe par le serveur Google (action « devis ») : Quentin
     reçoit un e-mail avec les photos en pièces jointes, le client un
     accusé de réception. Rien à faire dans sa boîte mail.
   ===================================================================== */
(function () {
  "use strict";

  var Site = window.Site;
  if (!Site) return;
  var C = Site.config, R = C.reservation || {};
  var el = Site.el, filled = Site.filled, byId = Site.byId;
  var API = filled(R.apiUrl) ? R.apiUrl.trim() : "";
  var EMAIL = ((C.contact || {}).email || "").trim();
  var TEL = (C.contact || {}).telephoneAffiche || "";
  var MAX_PHOTOS = 6, COTE_MAX = 1600, QUALITE = 0.8;

  /* ---------- Réduction d'une photo (canvas → JPEG base64) ---------- */
  function reduire(file) {
    return new Promise(function (ok, ko) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, COTE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        var cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var dataUrl = cv.toDataURL("image/jpeg", QUALITE);
        ok({ nom: (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg", type: "image/jpeg", data: dataUrl.split(",")[1], apercu: dataUrl });
      };
      img.onerror = function () { URL.revokeObjectURL(url); ko(new Error("format")); };
      img.src = url;
    });
  }

  /* ---------- Sélecteur de photos réutilisable ---------- */
  function photoPicker(opts) {
    opts = opts || {};
    var photos = [];
    var input = el("input", { type: "file", accept: "image/*", multiple: true, class: "photos__input" });
    var liste = el("div", { class: "photos__liste" });
    var info = el("p", { class: "photos__info", "aria-live": "polite" });
    var bouton = el("button", { type: "button", class: "btn btn--outline photos__ajout" }, ["+ Ajouter des photos"]);
    var box = el("div", { class: "photos" }, [
      el("span", { class: "photos__titre" }, [opts.titre || "Photos du véhicule ", el("small", { text: opts.facultatif === false ? "" : "(facultatif)" })]),
      opts.aide ? el("p", { class: "photos__aide", text: opts.aide }) : null,
      liste, bouton, input, info,
    ]);
    bouton.addEventListener("click", function () { input.click(); });

    function rendre() {
      liste.textContent = "";
      photos.forEach(function (p, i) {
        var suppr = el("button", { type: "button", class: "photos__suppr", "aria-label": "Retirer la photo " + (i + 1) }, ["×"]);
        suppr.addEventListener("click", function () { photos.splice(i, 1); rendre(); });
        liste.appendChild(el("div", { class: "photos__item" }, [el("img", { src: p.apercu, alt: "Photo " + (i + 1) }), suppr]));
      });
      bouton.hidden = photos.length >= MAX_PHOTOS;
      if (!info.dataset.msg) info.textContent = photos.length ? photos.length + " photo" + (photos.length > 1 ? "s" : "") + " · " + MAX_PHOTOS + " au maximum" : "";
    }

    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files || []);
      input.value = "";
      var place = MAX_PHOTOS - photos.length;
      var trop = files.length > place;
      files = files.slice(0, Math.max(0, place));
      info.dataset.msg = "";
      info.textContent = files.length ? "Préparation des photos…" : "";
      var erreurs = 0;
      files.reduce(function (p, f) {
        return p.then(function () { return reduire(f).then(function (r) { photos.push(r); }, function () { erreurs++; }); });
      }, Promise.resolve()).then(function () {
        var msg = [];
        if (erreurs) msg.push(erreurs + " photo" + (erreurs > 1 ? "s n'ont" : " n'a") + " pas pu être lue" + (erreurs > 1 ? "s" : "") + " (format non pris en charge).");
        if (trop) msg.push(MAX_PHOTOS + " photos au maximum.");
        info.dataset.msg = msg.length ? "1" : "";
        rendre();
        if (msg.length) info.textContent = msg.join(" ");
      });
    });
    rendre();

    return {
      el: box,
      liste: function () { return photos.map(function (p) { return { nom: p.nom, type: p.type, data: p.data }; }); },
      nombre: function () { return photos.length; },
      vider: function () { photos = []; info.dataset.msg = ""; rendre(); },
    };
  }
  Site.photoPicker = photoPicker;

  /* ---------- Fenêtre « Demandez votre devis » ---------- */
  var overlay, form, picker, corps, erreurBox, envoiBtn, envoye = false;

  function champ(label, input, full) {
    return el("label", { class: "field" + (full ? " field--full" : "") }, [el("span", null, [].concat(label)), input]);
  }

  function construire() {
    picker = photoPicker({ titre: "Photos de l'état du véhicule ", aide: "Sièges, tapis, coffre, taches… Prenez-les avec votre téléphone ou choisissez-les dans votre galerie.", facultatif: true });
    var vehicules = (C.vehicules || []).map(function (v) { return el("option", { value: v.id, text: v.nom }); });
    var formules = [el("option", { value: "", text: "Je ne sais pas encore" })].concat((C.formules || []).map(function (f) { return el("option", { value: f.id, text: f.nom }); }));
    erreurBox = el("p", { class: "booking__error", role: "alert" });
    envoiBtn = el("button", { type: "submit", class: "btn btn--accent btn--large btn--block" }, ["Envoyer ma demande de devis"]);
    form = el("form", { class: "devis__form", novalidate: true }, [
      el("div", { class: "fields" }, [
        champ("Prénom", el("input", { type: "text", name: "prenom", autocomplete: "given-name", required: true })),
        champ("Nom", el("input", { type: "text", name: "nom", autocomplete: "family-name" })),
        champ("Téléphone", el("input", { type: "tel", name: "telephone", autocomplete: "tel", inputmode: "tel" })),
        champ("E-mail", el("input", { type: "email", name: "email", autocomplete: "email", inputmode: "email", required: true })),
        champ("Véhicule", el("select", { name: "vehicule" }, vehicules)),
        champ("Formule souhaitée", el("select", { name: "formule" }, formules)),
        champ(["Votre demande ", el("small", { text: "(ce que vous souhaitez faire sur le véhicule)" })],
          el("textarea", { name: "demande", rows: "4", placeholder: "Ex. : véhicule de société utilisé tous les jours, sièges tachés, beaucoup de poussière dans le coffre…" }), true),
        el("label", { class: "hp", "aria-hidden": "true" }, ["Site web ", el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" })]),
      ]),
      picker.el,
      erreurBox,
      envoiBtn,
      el("p", { class: "devis__mail" }, EMAIL ? ["Votre demande est envoyée directement à Tout'Net (", el("a", { href: "mailto:" + EMAIL, text: EMAIL }), "). Vous n'avez rien d'autre à faire."] : []),
    ]);
    form.addEventListener("submit", function (e) { e.preventDefault(); envoyer(); });
    form.addEventListener("input", function (e) { e.target.classList.remove("is-invalid"); });

    corps = el("div", { class: "devis__corps" }, [
      el("h2", { id: "devis-titre", text: "Demandez votre devis" }),
      el("p", { class: "devis__intro", text: "Décrivez votre demande et ajoutez quelques photos du véhicule : Quentin vous répond avec un prix et une durée d'intervention." }),
      form,
    ]);
    var fermer = el("button", { type: "button", class: "devis__fermer", "aria-label": "Fermer", "data-devis-fermer": "" }, ["×"]);
    overlay = el("div", { class: "confirmation devis", role: "dialog", "aria-modal": "true", "aria-labelledby": "devis-titre", hidden: true }, [
      el("div", { class: "confirmation__inner devis__inner" }, [fermer, corps]),
    ]);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-devis-fermer]")) fermerDevis();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay && !overlay.hidden) fermerDevis(); });
    document.body.appendChild(overlay);
  }

  function ouvrir(vehicule, formule) {
    if (overlay && envoye) { overlay.parentNode.removeChild(overlay); overlay = null; envoye = false; }
    if (!overlay) construire();
    if (vehicule && byId(C.vehicules, vehicule)) form.elements.vehicule.value = vehicule;
    else { var d = (C.vehicules || []).filter(function (v) { return v.devis; })[0]; if (d) form.elements.vehicule.value = d.id; }
    if (formule !== undefined) form.elements.formule.value = byId(C.formules, formule) ? formule : "";
    erreurBox.textContent = "";
    overlay.hidden = false;
    overlay.scrollTop = 0;
    document.documentElement.classList.add("no-scroll");
    setTimeout(function () { form.elements.prenom.focus({ preventScroll: true }); }, 50);
  }
  function fermerDevis() {
    overlay.hidden = true;
    document.documentElement.classList.remove("no-scroll");
  }

  function v(name) { return String((form.elements[name] || {}).value || "").trim(); }

  function envoyer() {
    var bad = [];
    if (!v("prenom")) bad.push("prenom");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) bad.push("email");
    if (v("telephone") && v("telephone").replace(/\D/g, "").length < 10) bad.push("telephone");
    if (!v("demande") && !picker.nombre()) bad.push("demande");
    if (bad.length) {
      bad.forEach(function (n) { form.elements[n].classList.add("is-invalid"); });
      form.elements[bad[0]].focus();
      erreurBox.textContent = bad.indexOf("demande") > -1 && bad.length === 1
        ? "Décrivez votre demande ou ajoutez au moins une photo."
        : "Vérifiez les champs en rouge (prénom, e-mail valide, téléphone à 10 chiffres).";
      return;
    }
    var veh = byId(C.vehicules, v("vehicule")), f = byId(C.formules, v("formule"));
    var payload = {
      action: "devis",
      prenom: v("prenom"), nom: v("nom"), telephone: v("telephone"), email: v("email"),
      vehicule: veh ? veh.nom : v("vehicule"), formule: f ? f.nom : "Je ne sais pas encore",
      demande: v("demande"), photos: picker.liste(), website: v("website"),
    };
    erreurBox.textContent = "";
    envoiBtn.disabled = true;
    envoiBtn.textContent = "";
    envoiBtn.appendChild(el("span", { class: "spinner", "aria-hidden": "true" }));
    envoiBtn.appendChild(document.createTextNode(payload.photos.length ? "Envoi des photos…" : "Envoi…"));

    var req = API
      ? fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), redirect: "follow" }).then(function (r) { return r.json(); })
      : Promise.reject(new Error("pas de serveur"));
    req.then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.message) || "Erreur");
      corps.textContent = "";
      corps.appendChild(el("div", { class: "done__icon", html: Site.icons.ok, "aria-hidden": "true" }));
      corps.appendChild(el("h2", { id: "devis-titre", text: "Demande de devis envoyée" }));
      corps.appendChild(el("p", { text: "Merci " + payload.prenom + ". Quentin a bien reçu votre demande" + (payload.photos.length ? " et vos " + payload.photos.length + " photo" + (payload.photos.length > 1 ? "s" : "") : "") + ". Il vous répond par e-mail ou par téléphone avec un prix et une durée d'intervention." }));
      corps.appendChild(el("p", { text: "Un e-mail de confirmation vous a été envoyé à " + payload.email + "." }));
      corps.appendChild(el("div", { class: "done__actions" }, [el("button", { type: "button", class: "btn btn--accent btn--large", "data-devis-fermer": "" }, ["Retour au site"])]));
      envoye = true;
    }).catch(function (err) {
      console.error(err);
      envoiBtn.disabled = false;
      envoiBtn.textContent = "Envoyer ma demande de devis";
      var sujet = "Demande de devis — " + payload.vehicule;
      var corpsMail = "Bonjour Quentin,\n\nVéhicule : " + payload.vehicule + "\nFormule : " + payload.formule + "\n\n" + payload.demande +
        "\n\n" + payload.prenom + " " + payload.nom + (payload.telephone ? "\n" + payload.telephone : "");
      erreurBox.textContent = "";
      erreurBox.appendChild(document.createTextNode("L'envoi n'a pas abouti. Réessayez dans un instant" + (TEL ? ", appelez le " + TEL : "") + (EMAIL ? " ou " : ".")));
      if (EMAIL) {
        erreurBox.appendChild(el("a", { href: "mailto:" + EMAIL + "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corpsMail), text: "écrivez-nous par e-mail" }));
        erreurBox.appendChild(document.createTextNode(" en joignant vos photos."));
      }
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-devis]");
    if (!b) return;
    e.preventDefault();
    ouvrir(b.getAttribute("data-devis-vehicule"), b.getAttribute("data-devis-formule") || undefined);
  });
  Site.ouvrirDevis = ouvrir;
})();
