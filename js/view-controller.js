const inboxContent = document.getElementById('inbox-content');
const noraKimContent = document.getElementById('nora-kim-content');
const zoeBrooksContent = document.getElementById('zoe-brooks-content');
const rightSidebar = document.getElementById('right-sidebar');
const skinnyBar = document.getElementById('skinny-bar');

const navInbox = document.querySelector('a[href="#inbox"]');
const navNoraKim = document.querySelector('a[href="#fav1"]');
const navZoeBrooks = document.querySelector('a[href="#fav2"]');

function showView(viewName) {
  // Clear active state from all main nav links first
  [navInbox, navNoraKim, navZoeBrooks].forEach(link => {
    if (link) link.classList.remove('d-bgc-bold');
  });
  // Hide all content sections first
  if (inboxContent) inboxContent.style.display = 'none';
  if (noraKimContent) noraKimContent.style.display = 'none';
  if (zoeBrooksContent) zoeBrooksContent.style.display = 'none';

  // Show/hide sidebar and skinny bar
  if (viewName === 'inbox') {
    if (inboxContent) inboxContent.style.display = 'block';
          if (navInbox) navInbox.classList.add('d-bgc-bold');
    if (rightSidebar) rightSidebar.classList.add('hidden');
    if (skinnyBar) skinnyBar.classList.add('hidden');
  } else if (viewName === 'noraKim') {
    if (noraKimContent) noraKimContent.style.display = 'block';
          if (navNoraKim) navNoraKim.classList.add('d-bgc-bold');
    if (rightSidebar) rightSidebar.classList.remove('hidden');
    if (skinnyBar) skinnyBar.classList.remove('hidden');
  } else if (viewName === 'zoeBrooks') {
    if (zoeBrooksContent) zoeBrooksContent.style.display = 'block';
          if (navZoeBrooks) navZoeBrooks.classList.add('d-bgc-bold');
    if (rightSidebar) rightSidebar.classList.remove('hidden');
    if (skinnyBar) skinnyBar.classList.remove('hidden');
  }
}

if (navInbox) {
  navInbox.addEventListener('click', function(event) {
    event.preventDefault();
    showView('inbox');
  });
}

if (navNoraKim) {
  navNoraKim.addEventListener('click', function(event) {
    event.preventDefault();
    showView('noraKim');
  });
}

if (navZoeBrooks) {
  navZoeBrooks.addEventListener('click', function(event) {
    event.preventDefault();
    showView('zoeBrooks');
  });
}

// Right sidebar elements
const rightViewProfile = document.getElementById('right-view-profile');
const rightViewSalesforce = document.getElementById('right-view-salesforce');
const rightViewHubspot = document.getElementById('right-view-hubspot');
const rightSidebarViews = [rightViewProfile, rightViewSalesforce, rightViewHubspot];

// Skinny bar links
const skinnyLinkProfile = document.querySelector('a[href="#right-view-profile"]');
const skinnyLinkSalesforce = document.querySelector('a[href="#right-view-salesforce"]');
const skinnyLinkHubspot = document.querySelector('a[href="#right-view-hubspot"]');
const skinnyBarLinks = [skinnyLinkProfile, skinnyLinkSalesforce, skinnyLinkHubspot];

// Connect Salesforce button
const connectSalesforceBtn = document.getElementById('connect-salesforce-btn');

function showRightSidebarView(viewIdToShow) {
  rightSidebarViews.forEach(view => {
    if (view) {
      if (view.id === viewIdToShow) {
        view.style.display = 'block';
      } else {
        view.style.display = 'none';
      }
    }
  });

  skinnyBarLinks.forEach(link => {
    if (link) {
      if (link.getAttribute('href') === '#' + viewIdToShow) {
        link.classList.add('d-btn--active'); // Assuming Dialtone's active class or a custom one
      } else {
        link.classList.remove('d-btn--active');
      }
    }
  });
}

skinnyBarLinks.forEach(link => {
  if (link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetViewId = link.getAttribute('href').substring(1);
      showRightSidebarView(targetViewId);
    });
  }
});

if (connectSalesforceBtn) {
  connectSalesforceBtn.addEventListener('click', function(event) {
    event.preventDefault();
    showView('noraKim'); // Switch main content to Nora Kim
    showRightSidebarView('right-view-salesforce'); // Show Salesforce in right sidebar
  });
}

// Drag and Drop for Skinny Bar
const skinnyBarContainer = document.getElementById('skinny-bar');
const draggableSkinnyBarItems = document.querySelectorAll('.skinny-bar-item');
let draggedItem = null;
let skinnyBarPlaceholder = null;

function createSkinnyBarPlaceholder() {
  if (!skinnyBarPlaceholder) {
    skinnyBarPlaceholder = document.createElement('div');
    skinnyBarPlaceholder.classList.add('skinny-bar-placeholder');
    // The placeholder is not added to the DOM here, only when needed.
  }
}

createSkinnyBarPlaceholder(); // Create it once on script load

draggableSkinnyBarItems.forEach(item => {
  item.addEventListener('dragstart', (event) => {
    draggedItem = item;
    setTimeout(() => {
      item.classList.add('dragging');
    }, 0); // Timeout to allow the browser to render the drag image before hiding
    // To allow dropping on other elements, you might need:
    // event.dataTransfer.setData('text/plain', item.id); // if items have IDs
    // Ensure placeholder is not in DOM when drag starts from an item
    if (skinnyBarPlaceholder && skinnyBarPlaceholder.parentNode) {
      skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
    }
  });

  item.addEventListener('dragend', () => {
    // Final cleanup for placeholder
    if (skinnyBarPlaceholder && skinnyBarPlaceholder.parentNode) {
      skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
    }
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;
    }
  });
});

skinnyBarContainer.addEventListener('dragenter', (event) => {
  // Optional: Add class to container for styling when item enters
  // event.preventDefault(); // Important if you want to allow drop
  // skinnyBarContainer.classList.add('drag-over');
});

skinnyBarContainer.addEventListener('dragleave', (event) => {
  // Check if the leave is to an outside element, not a child
  if (!skinnyBarContainer.contains(event.relatedTarget) && skinnyBarPlaceholder.parentNode) {
    skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
  }
  // skinnyBarContainer.classList.remove('drag-over');
});

skinnyBarContainer.addEventListener('dragover', (event) => {
  event.preventDefault(); // Necessary to allow dropping
  const afterElement = getDragAfterElement(skinnyBarContainer, event.clientY);
  if (afterElement == null) {
    skinnyBarContainer.appendChild(skinnyBarPlaceholder);
  } else {
    skinnyBarContainer.insertBefore(skinnyBarPlaceholder, afterElement);
  }
});

function getSkinnyItemId(item) {
  if (!item) return null; // Guard against null items
  if (item.tagName === 'A' && item.getAttribute('href')) {
    return item.getAttribute('href'); // e.g., '#right-view-profile'
  } else if (item.id) {
    return '#' + item.id; // e.g., '#skinny-bar-more-btn' (prefix with # for consistency if desired)
  }
  console.warn('Skinny bar item has no identifiable href or id:', item);
  return null; // Should not happen if HTML is set up correctly
}

function saveSkinnyBarOrder() {
  const orderedItemIds = [];
  skinnyBarContainer.querySelectorAll('.skinny-bar-item').forEach(item => {
    const id = getSkinnyItemId(item);
    if (id) orderedItemIds.push(id);
  });
  localStorage.setItem('skinnyBarOrder', JSON.stringify(orderedItemIds));
  console.log('Skinny bar order saved:', orderedItemIds);
}

function loadAndApplySkinnyBarOrder() {
  const savedOrder = localStorage.getItem('skinnyBarOrder');
  console.log('Loading skinny bar order:', savedOrder);
  if (savedOrder) {
    try {
      const orderedItemIds = JSON.parse(savedOrder);
      if (!Array.isArray(orderedItemIds)) {
        console.error('Saved skinny bar order is not an array.');
        localStorage.removeItem('skinnyBarOrder'); // Clear invalid data
        return;
      }
      const itemsMap = new Map();
      // Create a map of items by their ID for easy lookup
      skinnyBarContainer.querySelectorAll('.skinny-bar-item').forEach(item => {
        const id = getSkinnyItemId(item);
        if (id) itemsMap.set(id, item);
      });

      // Detach all items first to avoid issues with reordering existing children
      const fragment = document.createDocumentFragment();
      orderedItemIds.forEach(id => {
        const itemToAppend = itemsMap.get(id);
        if (itemToAppend) {
          fragment.appendChild(itemToAppend); // Add to fragment in order
        }
      });
      skinnyBarContainer.innerHTML = ''; // Clear current items
      skinnyBarContainer.appendChild(fragment); // Append all in new order
      console.log('Skinny bar order applied.');
    } catch (e) {
      console.error('Error parsing or applying saved skinny bar order:', e);
      localStorage.removeItem('skinnyBarOrder'); // Clear invalid data
    }
  }
}


function saveSkinnyBarOrder() {
  const orderedItemIds = [];
  skinnyBarContainer.querySelectorAll('.skinny-bar-item').forEach(item => {
    const id = getSkinnyItemId(item);
    if (id) orderedItemIds.push(id);
  });
  localStorage.setItem('skinnyBarOrder', JSON.stringify(orderedItemIds));
}

function loadAndApplySkinnyBarOrder() {
  const savedOrder = localStorage.getItem('skinnyBarOrder');
  if (savedOrder) {
    try {
      const orderedItemIds = JSON.parse(savedOrder);
      const itemsMap = new Map();
      // Create a map of items by their ID for easy lookup
      skinnyBarContainer.querySelectorAll('.skinny-bar-item').forEach(item => {
        const id = getSkinnyItemId(item);
        if (id) itemsMap.set(id, item);
      });

      // Re-append items in the saved order
      orderedItemIds.forEach(id => {
        const itemToAppend = itemsMap.get(id);
        if (itemToAppend) {
          skinnyBarContainer.appendChild(itemToAppend);
        }
      });
    } catch (e) {
      console.error('Error parsing saved skinny bar order:', e);
      // Optionally clear the invalid item from localStorage
      // localStorage.removeItem('skinnyBarOrder');
    }
  }
}

skinnyBarContainer.addEventListener('drop', (event) => {
  event.preventDefault();
  if (!draggedItem) return;

  // Remove placeholder before dropping the actual item
  if (skinnyBarPlaceholder && skinnyBarPlaceholder.parentNode) {
    skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
  }

  // 1. Record initial positions of SIBLING items
  const siblings = [...skinnyBarContainer.querySelectorAll('.skinny-bar-item:not(.dragging)')];
  const initialSiblingPositions = new Map();
  siblings.forEach(sibling => {
    initialSiblingPositions.set(sibling, sibling.getBoundingClientRect());
  });

  // 2. Determine where the draggedItem will be dropped
  const dropTargetNode = getDragAfterElement(skinnyBarContainer, event.clientY);

  // 3. Perform the actual DOM move for the draggedItem.
  // The .dragging class is still on draggedItem. It will be removed in its 'dragend' handler.
  if (dropTargetNode === null) {
    skinnyBarContainer.appendChild(draggedItem);
  } else {
    skinnyBarContainer.insertBefore(draggedItem, dropTargetNode);
  }

  // 4. Animate siblings to their new positions (FLIP)
  siblings.forEach(sibling => {
    const oldPos = initialSiblingPositions.get(sibling);
    // Ensure the sibling is still in the DOM and was part of the initial scan
    if (!oldPos || !sibling.isConnected) return;

    const newPos = sibling.getBoundingClientRect();

    // Calculate the difference in position
    const deltaY = oldPos.top - newPos.top;
    // const deltaX = oldPos.left - newPos.left; // If horizontal movement was also possible

    if (deltaY !== 0 /* || deltaX !== 0 */) {
      // Invert: Apply transform to make it appear in its old position, without transition
      sibling.style.transitionProperty = 'none'; // Temporarily disable CSS transitions for this element's transform
      sibling.style.transform = `translateY(${deltaY}px)`;

      // Force browser to apply the above style change immediately (reflow)
      sibling.offsetHeight; // Reading a property like offsetHeight forces reflow

      // Play: Re-enable transitions (by removing the inline 'none') and set transform to its final state (0px)
      // The transition defined in the CSS class (.skinny-bar-item) will then animate it.
      sibling.style.transitionProperty = ''; // Revert to CSS-defined transition behavior
      sibling.style.transform = 'translateY(0px)';

      // Clean up the inline transform style after the animation completes
      sibling.addEventListener('transitionend', () => {
        sibling.style.transform = '';
      }, { once: true });
    }
  });
  saveSkinnyBarOrder(); // Save order after a successful drop
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.skinny-bar-item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Set initial views
showView('inbox');
showRightSidebarView('right-view-profile'); // Default right sidebar view, or choose another

// Load and apply saved skinny bar order on page load
// Ensure this is called after the skinny bar items are definitely in the DOM.
// Named function for drag start logic (ensure these are defined in a scope accessible by add/remove)
function handleSkinnyItemDragStart(event) {
  const item = event.target;
  draggedItem = item;
  setTimeout(() => {
    if (item.classList) item.classList.add('dragging'); // Check if item still exists and has classList
  }, 0);
  if (skinnyBarPlaceholder && skinnyBarPlaceholder.parentNode) {
    skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
  }
}

// Named function for drag end logic
function handleSkinnyItemDragEnd(event) {
  // const item = event.target; // event.target might be different if drag ended outside
  if (skinnyBarPlaceholder && skinnyBarPlaceholder.parentNode) {
    skinnyBarPlaceholder.parentNode.removeChild(skinnyBarPlaceholder);
  }
  if (draggedItem && draggedItem.classList) { // Check draggedItem and classList
    draggedItem.classList.remove('dragging');
  }
  draggedItem = null;
}

function addDragListenersToItemIfNeeded(item) {
  if (!item.dataset.dragListenersAttached) {
    item.addEventListener('dragstart', handleSkinnyItemDragStart);
    item.addEventListener('dragend', handleSkinnyItemDragEnd);
    item.dataset.dragListenersAttached = 'true';
  }
}

function removeDragListenersFromItem(item) {
  item.removeEventListener('dragstart', handleSkinnyItemDragStart);
  item.removeEventListener('dragend', handleSkinnyItemDragEnd);
  delete item.dataset.dragListenersAttached;
}

document.addEventListener('DOMContentLoaded', () => {
  loadAndApplySkinnyBarOrder(); // Keep existing call

  // Pulsating animation for Gmail button
  const gmailButton = document.getElementById('skinny-bar-gmail-btn');
  if (gmailButton) {
    gmailButton.classList.add('pulsate-animation');
    const stopPulsating = () => {
      gmailButton.classList.remove('pulsate-animation');
    };
    gmailButton.addEventListener('mouseenter', stopPulsating, { once: true });
  }

  // Skinny Bar Settings Menu Logic
  const settingsBtn = document.getElementById('skinny-bar-settings-btn');
  const settingsMenu = document.getElementById('skinny-bar-settings-menu');
  const menuTogglesContainer = document.getElementById('skinny-bar-menu-item-toggles');
  // skinnyBarContainer is already defined globally or in an accessible outer scope

  const nonToggleableItemIdsInMenu = ['skinny-bar-add-btn', 'skinny-bar-settings-btn'];
  const visibilityStorageKey = 'skinnyBarItemVisibility';

  function getPersistedVisibilityStates() {
    const storedStates = localStorage.getItem(visibilityStorageKey);
    return storedStates ? JSON.parse(storedStates) : {};
  }

  function saveItemVisibilityState(itemId, isVisible) {
    const states = getPersistedVisibilityStates();
    states[itemId] = isVisible;
    localStorage.setItem(visibilityStorageKey, JSON.stringify(states));
  }
  
  function populateSettingsMenu() {
    if (!skinnyBarContainer || !menuTogglesContainer) return;
    menuTogglesContainer.innerHTML = ''; // Clear existing toggles

    const items = Array.from(skinnyBarContainer.querySelectorAll('.skinny-bar-item'));
    items.forEach(item => {
      const itemId = item.id || item.getAttribute('href');
      if (!itemId || nonToggleableItemIdsInMenu.includes(item.id)) {
        return;
      }

      const itemName = item.title || itemId;
      const savedStates = getPersistedVisibilityStates();
      // Default to true (visible) if not in localStorage, or if item has no specific saved state
      const isVisible = savedStates.hasOwnProperty(itemId) ? savedStates[itemId] : true;

      const label = document.createElement('label');
      label.className = 'd-px16 d-checkbox d-h32 d-w100p d-cur-pointer h:d-bgc-purple-100 d-d-flex d-fd-column d-ai-center'; // Removed d-py8, added d-h24 and flex alignment
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = isVisible;
      input.className = 'd-checkbox__input';
      input.setAttribute('data-item-id', itemId);

      input.addEventListener('change', (event) => {
        const targetItemId = event.target.getAttribute('data-item-id');
        const itemToToggle = document.getElementById(targetItemId) || skinnyBarContainer.querySelector(`.skinny-bar-item[href='${targetItemId}']`);
        if (itemToToggle) {
          const show = event.target.checked;
          itemToToggle.style.display = show ? '' : 'none';
          itemToToggle.draggable = show;
          if (show) { addDragListenersToItemIfNeeded(itemToToggle); } 
          else { removeDragListenersFromItem(itemToToggle); }
          saveItemVisibilityState(targetItemId, show);
        }
      });

      const span = document.createElement('span');
      span.className = 'd-checkbox__label';
      span.textContent = itemName;

      label.appendChild(input);
      label.appendChild(span);
      menuTogglesContainer.appendChild(label);
    });
  }

  function toggleSettingsMenu() {
    if (!settingsMenu) return;
    const isOpen = settingsMenu.classList.contains('settings-menu--open');
    if (isOpen) {
      settingsMenu.classList.remove('settings-menu--open');
      settingsMenu.style.display = 'none';
    } else {
      populateSettingsMenu(); // Populate/refresh items each time it opens
      settingsMenu.classList.add('settings-menu--open');
      settingsMenu.style.display = 'block'; 
      // Position menu to the left of the settings button, aligned top
      if(settingsBtn && settingsMenu && skinnyBarContainer){
        const btnRect = settingsBtn.getBoundingClientRect();
        const skinnyBarRect = skinnyBarContainer.getBoundingClientRect(); // Parent for relative positioning
        
        settingsMenu.style.top = (btnRect.top - skinnyBarRect.top) + 'px';
        settingsMenu.style.left = (btnRect.left - skinnyBarRect.left - settingsMenu.offsetWidth - 8) + 'px'; // 8px gap to the left
        settingsMenu.style.bottom = 'auto'; // Ensure bottom doesn't interfere if menu is tall
      }
    }
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSettingsMenu();
    });
  }

  document.addEventListener('click', (event) => {
    if (settingsMenu && settingsMenu.classList.contains('settings-menu--open')) {
      if (!settingsMenu.contains(event.target) && event.target !== settingsBtn && !settingsBtn.contains(event.target)) {
        toggleSettingsMenu();
      }
    }
  });

  function applyPersistedVisibilityStates() {
    if (!skinnyBarContainer) return;
    const states = getPersistedVisibilityStates();
    const items = Array.from(skinnyBarContainer.querySelectorAll('.skinny-bar-item'));
    
    items.forEach(item => {
      const itemId = item.id || item.getAttribute('href');
      if (itemId && !nonToggleableItemIdsInMenu.includes(item.id)) { // Only apply to toggleable items
        // Default to true (visible) if not in localStorage
        const shouldBeVisible = states.hasOwnProperty(itemId) ? states[itemId] : true;
        item.style.display = shouldBeVisible ? '' : 'none';
        item.draggable = shouldBeVisible;
        if (shouldBeVisible) { addDragListenersToItemIfNeeded(item); } 
        else { removeDragListenersFromItem(item); }
      }
    });
  }
  applyPersistedVisibilityStates(); // Apply on load
});

