/**
 * My First Wrench — site behavior
 *
 * Prices, packages, ad copy, and the contact email are NOT in this file.
 * They live in /offerings.json. This script fetches that file and fills the
 * page so a price change in one place updates every page.
 *
 * To edit offerings: open offerings.json (see README.md).
 */
(function () {
  "use strict";

  var OFFERINGS_URL = "offerings.json";

  function money(n) {
    return "$" + Number(n);
  }

  function optionLabel(pkg) {
    var label = pkg.name + " — " + money(pkg.price);
    if (pkg.duration) label += " (" + pkg.duration + ")";
    return label;
  }

  function setAll(selector, text) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = text;
    });
  }

  function setHrefAll(selector, href) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.setAttribute("href", href);
    });
  }

  function renderHeroList(packages) {
    document.querySelectorAll("[data-hero-packages]").forEach(function (list) {
      list.innerHTML = "";
      packages.forEach(function (pkg) {
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.textContent = pkg.name + " — " + money(pkg.price);
        li.appendChild(strong);
        li.appendChild(document.createElement("br"));
        li.appendChild(document.createTextNode(pkg.hero || pkg.summary || ""));
        list.appendChild(li);
      });
    });
  }

  function renderPackages(packages, cta) {
    document.querySelectorAll("[data-packages]").forEach(function (grid) {
      grid.innerHTML = "";
      packages.forEach(function (pkg) {
        var card = document.createElement("article");
        card.className = pkg.featured ? "package-item featured" : "package-item";

        if (pkg.tag) {
          var badge = document.createElement("span");
          badge.className = "package-badge";
          badge.textContent = pkg.tag;
          card.appendChild(badge);
        }

        var header = document.createElement("div");
        header.className = "package-header";

        var h3 = document.createElement("h3");
        h3.className = "package-title";
        h3.textContent = pkg.name;
        header.appendChild(h3);

        var price = document.createElement("span");
        price.className = "package-price";
        price.appendChild(document.createTextNode(money(pkg.price)));
        if (pkg.duration) {
          price.appendChild(document.createTextNode(" "));
          var span = document.createElement("span");
          span.className = "price-duration";
          span.textContent = "/ " + pkg.duration;
          price.appendChild(span);
        }
        header.appendChild(price);
        card.appendChild(header);

        var summary = document.createElement("p");
        summary.textContent = pkg.summary || "";
        card.appendChild(summary);

        if (pkg.includes && pkg.includes.length) {
          var ul = document.createElement("ul");
          ul.className = "package-features";
          pkg.includes.forEach(function (item) {
            var li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          card.appendChild(ul);
        }

        var link = document.createElement("a");
        link.className = "btn";
        link.href = "book.html?package=" + encodeURIComponent(pkg.id);
        link.textContent = "Book " + pkg.name;
        if (cta) link.setAttribute("data-cta-label", "1");
        card.appendChild(link);

        grid.appendChild(card);
      });
    });
  }

  function renderPosts(posts) {
    document.querySelectorAll("[data-posts]").forEach(function (wrap) {
      var only = wrap.getAttribute("data-posts");
      wrap.innerHTML = "";
      var list = posts;
      if (only && only !== "all") {
        list = posts.filter(function (p) {
          return p.id === only;
        });
      }
      list.forEach(function (post) {
        var article = document.createElement("article");
        article.className = "post";
        var tag = document.createElement("p");
        tag.className = "tag";
        tag.textContent = post.tag || "";
        var body = document.createElement("p");
        body.textContent = post.body || "";
        article.appendChild(tag);
        article.appendChild(body);
        wrap.appendChild(article);
      });
    });
  }

  function fillBookForm(data) {
    var forms = document.querySelectorAll("[data-book-form]");
    forms.forEach(function (form) {
      form.setAttribute("action", "mailto:" + data.contact.email);

      var select = form.querySelector("#package");
      if (select) {
        var current = select.value;
        select.innerHTML = "";
        var unsure = document.createElement("option");
        unsure.value = "";
        unsure.textContent = "Not sure yet";
        select.appendChild(unsure);
        data.packages.forEach(function (pkg) {
          var opt = document.createElement("option");
          opt.value = pkg.id;
          opt.textContent = optionLabel(pkg);
          select.appendChild(opt);
        });
        var params = new URLSearchParams(window.location.search);
        var wanted = params.get("package") || current;
        if (wanted) {
          var match = Array.prototype.some.call(select.options, function (opt) {
            return opt.value === wanted;
          });
          if (match) {
            select.value = wanted;
            select.dispatchEvent(new Event("change"));
          }
        }
      }
    });
  }

  function wireForm(data) {
    var form = document.getElementById("book-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    var email = data.contact.email;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = ((form.elements.namedItem("name") || {}).value || "").trim();
      var emailVal = ((form.elements.namedItem("email") || {}).value || "").trim();
      var phoneVal = ((form.elements.namedItem("phone") || {}).value || "").trim();
      var pref = ((form.elements.namedItem("contact-pref") || {}).value || "").trim();
      var pkg = ((form.elements.namedItem("package") || {}).value || "").trim();
      var skill = ((form.elements.namedItem("skill") || {}).value || "").trim();
      var year = ((form.elements.namedItem("year") || {}).value || "").trim();
      var make = ((form.elements.namedItem("make") || {}).value || "").trim();
      var model = ((form.elements.namedItem("model") || {}).value || "").trim();
      var vin = ((form.elements.namedItem("vin") || {}).value || "").trim().toUpperCase();
      var note = ((form.elements.namedItem("message") || {}).value || "").trim();

      if (!name) {
        if (status) status.textContent = "Add your name and a way to reach you.";
        return;
      }
      if (!emailVal && !phoneVal) {
        if (status) status.textContent = "Add an email or a phone number.";
        return;
      }
      if (!pref) {
        if (status) status.textContent = "Pick the best way to reach you: phone, text, or email.";
        return;
      }
      if (pref === "email" && !emailVal) {
        if (status) status.textContent = "Add an email — that’s the best way you picked.";
        return;
      }
      if ((pref === "phone" || pref === "text") && !phoneVal) {
        if (status) status.textContent = "Add a phone number — that’s the best way you picked.";
        return;
      }

      var pkgLabel = pkg;
      data.packages.forEach(function (p) {
        if (p.id === pkg) pkgLabel = optionLabel(p);
      });

      var skillField = form.elements.namedItem("skill");
      var skillLabel = skill;
      if (skillField && skillField.options && skillField.selectedIndex >= 0) {
        skillLabel = skillField.options[skillField.selectedIndex].text || skill;
      }
      var wants = "not sure yet";
      if (pkg) wants = pkgLabel;
      else if (skill) wants = skillLabel;

      var vehicle = [year, make, model].filter(Boolean).join(" ");
      var prefLabel = pref === "text" ? "Text" : pref === "phone" ? "Phone" : pref === "email" ? "Email" : pref;
      var lines = [
        "Hi Raz — I want to book a driveway lesson.",
        "Name: " + name,
        "Email: " + (emailVal || "not given"),
        "Phone: " + (phoneVal || "not given"),
        "Best way to contact: " + prefLabel,
        "Wants: " + wants,
      ];
      lines.push("Vehicle: " + (vehicle || "not given"));
      if (vin) lines.push("VIN: " + vin);
      if (note) lines.push("Note: " + note);

      var body = encodeURIComponent(lines.join("\\n"));
      var subject = encodeURIComponent("My First Wrench booking");
      window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;

      if (status) {
        status.textContent =
          "Your email app should open with the booking note. If it does not, email " + email + ".";
      }
    });
  }

  function apply(data) {
    var email = data.contact.email;
    var brand = data.brand || {};

    setAll("[data-brand-name]", brand.name || "My First Wrench");
    setAll("[data-brand-byline]", brand.byline || "by Raz");
    setAll("[data-brand-tagline]", brand.tagline || "");
    setAll("[data-cta]", data.contact.cta || "Message Raz to book");
    setAll("[data-contact-email]", email);
    setAll("[data-parts-extra]", (data.notes && data.notes.partsExtra) || "");
    setAll("[data-parts-fine]", (data.notes && data.notes.partsFine) || "");
    setHrefAll("[data-contact-mailto]", "mailto:" + email);

    renderHeroList(data.packages || []);
    renderPackages(data.packages || [], data.contact.cta);
    renderPosts(data.posts || []);
    fillBookForm(data);
    wireForm(data);
    wireVehiclePicker();

    document.querySelectorAll("[data-offerings-ready]").forEach(function (el) {
      el.removeAttribute("hidden");
    });
    var warn = document.getElementById("offerings-status");
    if (warn) warn.hidden = true;
  }

  function fail() {
    var warn = document.getElementById("offerings-status");
    if (warn) warn.hidden = false;
  }

  function wireChoiceOr() {
    var wrap = document.querySelector("[data-choice-or]");
    if (!wrap) return;
    var pkg = wrap.querySelector("#package");
    var skill = wrap.querySelector("#skill");
    if (!pkg || !skill) return;

    function sync() {
      var pkgGroup = pkg.closest(".form-group");
      var skillGroup = skill.closest(".form-group");
      if (pkgGroup) pkgGroup.classList.toggle("is-idle", !!skill.value && !pkg.value);
      if (skillGroup) skillGroup.classList.toggle("is-idle", !!pkg.value && !skill.value);
    }

    pkg.addEventListener("change", function () {
      if (pkg.value && skill.value) skill.value = "";
      sync();
    });
    skill.addEventListener("change", function () {
      if (skill.value && pkg.value) pkg.value = "";
      sync();
    });
    sync();
  }

  function wireSavingsTabs() {
    var wrap = document.querySelector("[data-savings-tabs]");
    if (!wrap) return;
    var buttons = wrap.querySelectorAll("[data-tab]");
    var panels = document.querySelectorAll(".comparison-view");

    function show(id) {
      buttons.forEach(function (btn) {
        var on = btn.getAttribute("data-tab") === id;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (panel) {
        var on = panel.id === id;
        panel.classList.toggle("active", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    }

    wrap.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-tab]");
      if (!btn || !wrap.contains(btn)) return;
      show(btn.getAttribute("data-tab"));
    });
  }

  var NHTSA = "https://vpic.nhtsa.dot.gov/api/vehicles";
  var COMMON_MAKES = [
    "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
    "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia",
    "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi",
    "Nissan", "Pontiac", "Porsche", "Ram", "Subaru", "Tesla", "Toyota",
    "Volkswagen", "Volvo", "Polaris", "Yamaha", "Kawasaki", "Suzuki",
    "Harley-Davidson", "Can-Am", "Honda Powersports"
  ];

  function fillDatalist(id, values) {
    var list = document.getElementById(id);
    if (!list) return;
    list.innerHTML = "";
    values.forEach(function (value) {
      if (!value) return;
      var opt = document.createElement("option");
      opt.value = value;
      list.appendChild(opt);
    });
  }

  function titleCaseMake(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\\b([a-z])/g, function (m) { return m.toUpperCase(); });
  }

  function loadModels(year, make, modelInput) {
    if (!make) return;
    var url = NHTSA + "/GetModelsForMakeYear/make/" + encodeURIComponent(make) +
      (year ? "/modelyear/" + encodeURIComponent(year) : "") +
      "?format=json";
    fetch(url)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !data.Results) return;
        var models = [];
        var seen = {};
        data.Results.forEach(function (row) {
          var name = row.Model_Name || row.Model;
          if (!name || seen[name]) return;
          seen[name] = true;
          models.push(name);
        });
        models.sort();
        fillDatalist("model-list", models);
        if (modelInput && models.length === 1 && !modelInput.value) {
          modelInput.value = models[0];
        }
      })
      .catch(function () {});
  }

  function decodeVin(vin, fields, status) {
    var clean = String(vin || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (clean.length !== 17) {
      if (status) status.textContent = "A VIN is 17 characters. Paste it, or skip and pick year / make / model.";
      return;
    }
    if (status) status.textContent = "Looking that VIN up…";
    fetch(NHTSA + "/DecodeVinValues/" + encodeURIComponent(clean) + "?format=json")
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var row = data && data.Results && data.Results[0];
        if (!row) throw new Error("empty");
        var err = String(row.ErrorCode || "");
        var year = row.ModelYear || "";
        var make = titleCaseMake(row.Make || "");
        var model = row.Model || "";
        if (!year && !make && !model) throw new Error("blank");
        if (fields.year) fields.year.value = year;
        if (fields.make) fields.make.value = make;
        if (fields.model) fields.model.value = model;
        if (fields.vin) fields.vin.value = clean;
        loadModels(year, make, fields.model);
        var label = [year, make, model].filter(Boolean).join(" ");
        if (status) {
          status.textContent = label
            ? "Found: " + label + "."
            : "VIN read, but year / make / model did not come back. Type them below.";
        }
      })
      .catch(function () {
        if (status) status.textContent = "Could not look that VIN up. Type year, make, and model instead.";
      });
  }

  function wireVehiclePicker() {
    var wrap = document.querySelector("[data-vehicle-picker]");
    if (!wrap) return;
    var yearInput = wrap.querySelector("#year");
    var makeInput = wrap.querySelector("#make");
    var modelInput = wrap.querySelector("#model");
    var vinInput = wrap.querySelector("#vin");
    var lookupBtn = wrap.querySelector("[data-vin-lookup]");
    var status = wrap.querySelector("[data-vin-status]");
    var thisYear = new Date().getFullYear();
    var years = [];
    for (var y = thisYear + 1; y >= 1970; y--) years.push(String(y));
    fillDatalist("year-list", years);
    fillDatalist("make-list", COMMON_MAKES);

    function refreshModels() {
      loadModels(
        yearInput ? yearInput.value.trim() : "",
        makeInput ? makeInput.value.trim() : "",
        modelInput
      );
    }

    if (makeInput) makeInput.addEventListener("change", refreshModels);
    if (yearInput) yearInput.addEventListener("change", refreshModels);
    if (lookupBtn) {
      lookupBtn.addEventListener("click", function () {
        decodeVin(vinInput && vinInput.value, {
          year: yearInput,
          make: makeInput,
          model: modelInput,
          vin: vinInput
        }, status);
      });
    }
    if (vinInput) {
      vinInput.addEventListener("input", function () {
        var clean = vinInput.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (vinInput.value !== clean) vinInput.value = clean;
        if (clean.length === 17) {
          decodeVin(clean, {
            year: yearInput,
            make: makeInput,
            model: modelInput,
            vin: vinInput
          }, status);
        }
      });
    }
  }

  fetch(OFFERINGS_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load offerings.json");
      return res.json();
    })
    .then(apply)
    .catch(fail);

  wireSavingsTabs();
  wireChoiceOr();
})();
