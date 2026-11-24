/* =====================================================================
   TOUT'NET — SECTION « À DOMICILE OU À L'ATELIER »
   Deux cartes construites à partir de SITE_CONFIG.reservation.lieux.
   Le bouton de chaque carte présélectionne le lieu dans la réservation.
   ===================================================================== */
(function () {
  "use strict";

  var Site = window.Site;
  var C = window.SITE_CONFIG || {};
  var section = document.getElementById("lieux");
  if (!Site || !section) return;
  var el = Site.el;
  var S = C.sectionLieux || {};
  var LIEUX = (C.reservation || {}).lieux || [];
  var TEL = (C.contact || {}).telephoneAffiche || "";

  section.querySelector("[data-lieux-titre]").textContent = S.titre || "";
  section.querySelector("[data-lieux-intro]").textContent = S.intro || "";

  var box = section.querySelector("[data-lieux-cartes]");
  LIEUX.forEach(function (l) {
    box.appendChild(el("article", { class: "lieu-carte" }, [
      el("span", { class: "lieu-carte__icone", html: Site.icons[l.icone] || "", "aria-hidden": "true" }),
      el("h3", { text: l.nom }),
      el("p", { class: "lieu-carte__texte", text: l.accroche || l.description || "" }),
      (l.villes || []).length ? el("p", { class: "lieu-carte__etiquette", text: l.etiquetteVilles || "" }) : null,
      (l.villes || []).length ? el("ul", { class: "lieu-carte__villes" }, l.villes.map(function (v) { return el("li", { text: v }); })) : null,
      el("a", { class: "btn btn--accent lieu-carte__btn", href: "#choix-lieu", "data-choisir-lieu": l.id, text: l.bouton || "Réserver" }),
    ]));
  });

  var note = section.querySelector("[data-lieux-note]");
  if (TEL) {
    note.appendChild(document.createTextNode("Une question avant de réserver ? Appelez Quentin au "));
    note.appendChild(el("a", { href: "tel:+" + String((C.contact || {}).telephone || "").replace(/\D/g, ""), text: TEL }));
    note.appendChild(document.createTextNode("."));
  }
})();
