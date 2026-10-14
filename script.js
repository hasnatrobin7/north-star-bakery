var STORAGE_KEY = "northStarPickup";

var PRODUCT_GROUPS = [
  { id: "breads", name: "Breads", note: "Loaves from $6 to $12" },
  { id: "pastries", name: "Pastries", note: "Most pieces $3 to $6" },
  { id: "cakes", name: "Cakes", note: "Usually $28 to $60" }
];

var ERROR_MESSAGES = {
  nameRequired: "Enter your name using letters.",
  emailRequired: "Enter your email address.",
  emailFormat: "Enter a complete email address, such as name@example.com.",
  dateRequired: "Choose a pickup date.",
  typeRequired: "Choose a request type.",
  detailsRequired: "Describe the items you want.",
  detailsLength: "Use at least 10 characters so the bakery knows what to hold."
};

function loadSavedIds() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    return [];
  }
}

function storeSavedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function findProduct(id) {
  var index;
  for (index = 0; index < PRODUCT_GROUPS.length; index += 1) {
    if (PRODUCT_GROUPS[index].id === id) {
      return PRODUCT_GROUPS[index];
    }
  }
  return null;
}

function renderBanner(ids) {
  var banner = document.getElementById("saved-banner");
  if (!banner) {
    return;
  }
  if (ids.length === 0) {
    banner.hidden = true;
    banner.textContent = "";
    return;
  }
  var names = [];
  var index;
  for (index = 0; index < ids.length; index += 1) {
    var product = findProduct(ids[index]);
    if (product) {
      names.push(product.name);
    }
  }
  banner.hidden = false;
  banner.textContent = "Saved for pickup: " + names.join(", ") + ".";
}

function renderPickupList(ids) {
  var list = document.getElementById("pickup-items");
  var emptyMessage = document.getElementById("pickup-empty");
  var clearButton = document.getElementById("clear-saved");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  var index;
  for (index = 0; index < ids.length; index += 1) {
    var product = findProduct(ids[index]);
    if (!product) {
      continue;
    }
    var item = document.createElement("li");
    item.textContent = product.name + " - " + product.note;
    list.appendChild(item);
  }
  if (emptyMessage) {
    emptyMessage.hidden = ids.length > 0;
  }
  if (clearButton) {
    clearButton.hidden = ids.length === 0;
  }
  var buttons = document.querySelectorAll(".save-button");
  var buttonIndex;
  for (buttonIndex = 0; buttonIndex < buttons.length; buttonIndex += 1) {
    var button = buttons[buttonIndex];
    var id = button.getAttribute("data-product-id");
    var productForButton = findProduct(id);
    var saved = ids.indexOf(id) !== -1;
    if (saved) {
      button.classList.add("is-saved");
    } else {
      button.classList.remove("is-saved");
    }
    if (productForButton) {
      if (saved) {
        button.textContent = "Remove " + productForButton.name.toLowerCase() + " from pickup";
      } else {
        button.textContent = "Save " + productForButton.name.toLowerCase() + " for pickup";
      }
    }
  }
}

function toggleSaved(id) {
  var ids = loadSavedIds();
  var position = ids.indexOf(id);
  if (position === -1) {
    ids.push(id);
  } else {
    ids.splice(position, 1);
  }
  storeSavedIds(ids);
  renderPickupList(ids);
  renderBanner(ids);
}

function clearSaved() {
  storeSavedIds([]);
  renderPickupList([]);
  renderBanner([]);
}

function setupPickup() {
  var ids = loadSavedIds();
  renderBanner(ids);
  renderPickupList(ids);
  var buttons = document.querySelectorAll(".save-button");
  var index;
  for (index = 0; index < buttons.length; index += 1) {
    buttons[index].addEventListener("click", function (event) {
      toggleSaved(event.currentTarget.getAttribute("data-product-id"));
    });
  }
  var clearButton = document.getElementById("clear-saved");
  if (clearButton) {
    clearButton.addEventListener("click", clearSaved);
  }
}

function setFieldError(inputId, errorId, message) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(errorId);
  if (!error) {
    return;
  }
  error.textContent = message;
  if (!input) {
    return;
  }
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function validateRequestForm() {
  var name = document.getElementById("customer-name").value.trim();
  var email = document.getElementById("customer-email").value.trim();
  var date = document.getElementById("pickup-date").value;
  var requestType = document.getElementById("request-type").value;
  var details = document.getElementById("item-details").value.trim();
  var valid = true;
  var namePattern = /^[A-Za-z][A-Za-z '\-]{1,}$/;
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!namePattern.test(name)) {
    setFieldError("customer-name", "name-error", ERROR_MESSAGES.nameRequired);
    valid = false;
  } else {
    setFieldError("customer-name", "name-error", "");
  }

  if (email === "") {
    setFieldError("customer-email", "email-error", ERROR_MESSAGES.emailRequired);
    valid = false;
  } else if (!emailPattern.test(email)) {
    setFieldError("customer-email", "email-error", ERROR_MESSAGES.emailFormat);
    valid = false;
  } else {
    setFieldError("customer-email", "email-error", "");
  }

  if (date === "") {
    setFieldError("pickup-date", "date-error", ERROR_MESSAGES.dateRequired);
    valid = false;
  } else {
    setFieldError("pickup-date", "date-error", "");
  }

  if (requestType === "") {
    setFieldError("request-type", "type-error", ERROR_MESSAGES.typeRequired);
    valid = false;
  } else {
    setFieldError("request-type", "type-error", "");
  }

  if (details === "") {
    setFieldError("item-details", "details-error", ERROR_MESSAGES.detailsRequired);
    valid = false;
  } else if (details.length < 10) {
    setFieldError("item-details", "details-error", ERROR_MESSAGES.detailsLength);
    valid = false;
  } else {
    setFieldError("item-details", "details-error", "");
  }

  return valid;
}

function setupForm() {
  var form = document.getElementById("request-form");
  if (!form) {
    return;
  }
  form.addEventListener("submit", function (event) {
    var success = document.getElementById("form-success");
    var valid = validateRequestForm();
    if (!valid) {
      event.preventDefault();
      if (success) {
        success.hidden = true;
      }
      return;
    }
    event.preventDefault();
    if (success) {
      success.hidden = false;
    }
  });
}

setupPickup();
setupForm();
