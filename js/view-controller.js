let isSalesforceLoggedIn = false;
let currentMainView = 'inbox'; // Initialize with default view
const visibilityStorageKey = 'skinnyBarItemVisibility';
const orderStorageKey = 'skinnyBarItemOrder';
// const nonToggleableItemIdsInSettingsMenu removed.

const rightSidebar = document.getElementById('right-sidebar');
const skinnyBar = document.getElementById('skinny-bar');
let currentRightSidebarViewId = null;
let activeSkinnyBarButtonId = null;

const rightSidebarViews = Array.from(document.querySelectorAll('.right-bar-view')).filter(v => v);

// --- Main View Switching (Inbox, Nora Kim, Zoe Brooks) ---
function showMainView(viewName) {
  console.log(`[showMainView CALLED] viewName: ${viewName}`);
  currentMainView = viewName; // Update currentMainView state
  document.querySelectorAll('#inbox-content, #nora-kim-content, #zoe-brooks-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('a[href="#inbox"], a[href="#fav1"], a[href="#fav2"]').forEach(link => link.classList.remove('d-bgc-bold'));

  let contentToShowId;
  let navLinkToBoldId;
  let viewIdToLoadForSidebar = null;

  if (viewName === 'inbox') {
    contentToShowId = 'inbox-content';
    navLinkToBoldId = 'a[href="#inbox"]';
    if (rightSidebar) rightSidebar.classList.add('hidden');
    if (skinnyBar) skinnyBar.classList.add('hidden');
    currentRightSidebarViewId = null;
    activeSkinnyBarButtonId = null;
  } else if (viewName === 'noraKim') {
    contentToShowId = 'nora-kim-content';
    navLinkToBoldId = 'a[href="#fav1"]';
    viewIdToLoadForSidebar = 'right-view-salesforce';
    if (rightSidebar) rightSidebar.classList.remove('hidden');
    if (skinnyBar) skinnyBar.classList.remove('hidden');
  } else if (viewName === 'zoeBrooks') {
    contentToShowId = 'zoe-brooks-content';
    navLinkToBoldId = 'a[href="#fav2"]';
    viewIdToLoadForSidebar = 'right-view-salesforce';
    if (rightSidebar) rightSidebar.classList.remove('hidden');
    if (skinnyBar) skinnyBar.classList.remove('hidden');
  } else {
    // Fallback for unknown viewName - explicitly set to empty string
    contentToShowId = ''; 
    navLinkToBoldId = '';
    console.warn(`[showMainView] Unknown viewName: '${viewName}'. Defaulting to no content shown.`);
  }

  console.log(`[showMainView Debug] Attempting to use ID: '${contentToShowId}' for viewName: '${viewName}'`);
  const contentToShow = contentToShowId ? document.getElementById(contentToShowId) : null;
  const navLinkToBold = navLinkToBoldId ? document.querySelector(navLinkToBoldId) : null;

  if (contentToShow) {
    contentToShow.style.display = 'block';
    console.log(`[showMainView for ${viewName}] Set ${contentToShow.id}.style.display to 'block'. Actual: ${contentToShow.style.display}`);
  } else {
    // This block is reached if contentToShowId was valid but getElementById failed, OR if contentToShowId was empty.
    console.error("[showMainView for " + viewName + "] FAILED to find/display main content DIV. ID used was: '" + contentToShowId + "'. This means either the ID is incorrect, the element is missing from index.html, or viewName was unexpected.");
  }
  if (navLinkToBold) navLinkToBold.classList.add('d-bgc-bold');

  if (viewIdToLoadForSidebar) {
    let firstVisibleAppButton = skinnyBar.querySelector('button.skinny-bar-item[data-view-id]:not([style*="display: none"])');
    let viewIdToLoad = null;
    let buttonIdToActivate = null;

    if (firstVisibleAppButton) {
        viewIdToLoad = firstVisibleAppButton.dataset.viewId;
        buttonIdToActivate = firstVisibleAppButton.id;
    } else { // Fallback if all app buttons are hidden
        const profileBtn = document.getElementById('skinny-bar-profile-btn');
        if (profileBtn && profileBtn.dataset.viewId && profileBtn.style.display !== 'none') {
            viewIdToLoad = profileBtn.dataset.viewId;
            buttonIdToActivate = profileBtn.id;
        }
    }
    
    updateActiveSkinnyButtonState(buttonIdToActivate);
    const salesforceContext = (viewName === 'zoeBrooks') ? 'no-contact-matched' : 'contact-matched';
    showRightSidebarViewContent(viewIdToLoad, salesforceContext);
  }

  // The redundant block that was here has been removed.
}

document.querySelector('a[href="#inbox"]')?.addEventListener('click', (e) => { e.preventDefault(); showMainView('inbox'); });
document.querySelector('a[href="#fav1"]')?.addEventListener('click', (e) => { e.preventDefault(); showMainView('noraKim'); });
document.querySelector('a[href="#fav2"]')?.addEventListener('click', (e) => { e.preventDefault(); showMainView('zoeBrooks'); });


// --- Right Sidebar View Content Management ---
async function loadSalesforcePage(initialContextForSF) { // Renamed argument
  const salesforceViewContainer = document.getElementById('right-view-salesforce');
  if (!salesforceViewContainer) return console.error('SF container not found.');
  const salesforcePageContentDiv = salesforceViewContainer.querySelector('#salesforce-view-body');
  if (!salesforcePageContentDiv) return console.error('SF body not found.');

  let actualPageToLoad = initialContextForSF; // Use renamed argument
  if (!isSalesforceLoggedIn) {
    if (initialContextForSF === 'contact-matched') { // Use renamed argument
      actualPageToLoad = 'salesforce-login-nora';
    } else if (initialContextForSF === 'no-contact-matched') { // Use renamed argument
      actualPageToLoad = 'salesforce-login-zoe';
    } else {
      actualPageToLoad = 'salesforce-login-nora'; // Default fallback
    }
  }
  // Note: If isSalesforceLoggedIn is true, actualPageToLoad remains the initially passed pageName.

  salesforcePageContentDiv.innerHTML = '<p>Loading...</p>'; // Indicate loading
  try {
    const salesforceViewsPath = 'sidebar-apps/salesforce/';
    console.log(`[loadSalesforcePage] Called with context: ${initialContextForSF}, currentMainView: ${currentMainView}`);
    const response = await fetch(`${salesforceViewsPath}${actualPageToLoad}.html`);
    if (!response.ok) throw new Error(`Failed to load ${actualPageToLoad}: ${response.statusText}`);
    salesforcePageContentDiv.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading Salesforce page:', error);
    salesforcePageContentDiv.innerHTML = '<p>Error loading content.</p>';
  }
}

function showRightSidebarViewContent(viewIdToShow, salesforceContextSubPage = null) {
  if (!viewIdToShow) {
    if (rightSidebar) rightSidebar.classList.add('hidden');
    currentRightSidebarViewId = null;
    return;
  }

  if (rightSidebar) rightSidebar.classList.remove('hidden');
  rightSidebarViews.forEach(view => {
    if (view) view.style.display = (view.id === viewIdToShow) ? 'block' : 'none';
  });

  if (viewIdToShow === 'right-view-salesforce') {
    loadSalesforcePage(salesforceContextSubPage);
  }
  currentRightSidebarViewId = viewIdToShow;
}

function updateActiveSkinnyButtonState(buttonIdToActivate) {
  activeSkinnyBarButtonId = buttonIdToActivate;
  if (skinnyBar) {
    skinnyBar.querySelectorAll('button.skinny-bar-item[data-view-id]').forEach(btn => {
      btn.classList.toggle('d-btn--active', btn.id === activeSkinnyBarButtonId);
    });
  }
}

// --- Drag and Drop ---
let draggedButton = null;
let placeholder = null;

function createPlaceholder() {
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.classList.add('skinny-bar-placeholder');
  }
  return placeholder;
}

function onDragStart(event) {
  const targetButton = event.target.closest('button.skinny-bar-item');
  if (!targetButton || !targetButton.draggable) {
    event.preventDefault();
    return;
  }
  draggedButton = targetButton;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', draggedButton.id); // Necessary for Firefox
  setTimeout(() => { if(draggedButton) draggedButton.classList.add('dragging'); }, 0);
  console.log('[D&D] Drag Start:', draggedButton.id);
}

function onDragEnd(event) {
  if (!draggedButton) return;
  console.log('[D&D] Drag End:', draggedButton.id);
  draggedButton.classList.remove('dragging');
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
  draggedButton = null;
}

function onDragOver(event) {
  event.preventDefault(); // Allow drop
  if (!draggedButton) return;
  const currentPlaceholder = createPlaceholder();
  const afterElement = getDragAfterElement(skinnyBar, event.clientY);
  if (afterElement) {
    skinnyBar.insertBefore(currentPlaceholder, afterElement);
  } else {
    skinnyBar.appendChild(currentPlaceholder);
  }
}
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('button.skinny-bar-item:not(.dragging):not(.skinny-bar-placeholder)')];
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


function onDrop(event) {
  event.preventDefault();
  if (!draggedButton || !placeholder || !placeholder.parentNode) {
    console.log('[D&D] Drop aborted: no draggedButton or placeholder invalid.');
    return;
  }
  console.log('[D&D] Drop:', draggedButton.id);
  skinnyBar.insertBefore(draggedButton, placeholder);
  saveSkinnyBarOrder();
}

function saveSkinnyBarOrder() {
  if (!skinnyBar) return;
  const orderedItemIds = Array.from(skinnyBar.querySelectorAll('button.skinny-bar-item'))
                              .map(btn => btn.id)
                              .filter(id => id);
  localStorage.setItem(orderStorageKey, JSON.stringify(orderedItemIds));
  console.log('[D&D] Order Saved:', orderedItemIds);
}

function loadAndApplySkinnyBarOrder() {
  if (!skinnyBar) return;
  const savedOrder = localStorage.getItem(orderStorageKey);
  // console.log('[D&D] Loading Order:', savedOrder);
  if (savedOrder) {
    try {
      const orderedItemIds = JSON.parse(savedOrder);
      if (!Array.isArray(orderedItemIds)) throw new Error('Saved order is not an array');
      
      const itemsMap = new Map();
      skinnyBar.querySelectorAll('button.skinny-bar-item').forEach(btn => {
        if (btn.id) itemsMap.set(btn.id, btn);
      });

      const fragment = document.createDocumentFragment();
      orderedItemIds.forEach(id => {
        const itemToAppend = itemsMap.get(id);
        if (itemToAppend) {
          fragment.appendChild(itemToAppend);
          itemsMap.delete(id);
        } else {
          console.warn(`[D&D] Item ID "${id}" from saved order not found in DOM.`);
        }
      });
      itemsMap.forEach(item => { // Append any new items not in saved order
          fragment.appendChild(item);
      });

      skinnyBar.innerHTML = ''; // Clear existing items
      skinnyBar.appendChild(fragment);
      // console.log('[D&D] Order Applied.');
    } catch (e) {
      console.error('[D&D] Error parsing/applying order:', e);
      localStorage.removeItem(orderStorageKey);
    }
  }
}

function manageDragListeners(buttonElement, add) {
    if (!buttonElement) return;
    const alreadyHasListeners = buttonElement.getAttribute('data-drag-listeners-added') === 'true';
    if (add && buttonElement.draggable && !alreadyHasListeners) {
        buttonElement.addEventListener('dragstart', onDragStart);
        buttonElement.addEventListener('dragend', onDragEnd);
        buttonElement.setAttribute('data-drag-listeners-added', 'true');
        // console.log('[D&D] Added listeners to', buttonElement.id);
    } else if (!add && alreadyHasListeners) {
        buttonElement.removeEventListener('dragstart', onDragStart);
        buttonElement.removeEventListener('dragend', onDragEnd);
        buttonElement.removeAttribute('data-drag-listeners-added');
        // console.log('[D&D] Removed listeners from', buttonElement.id);
    }
}


// Settings menu DOM element consts (settingsBtnElement, settingsMenuElement, menuTogglesContainer) removed.

// getPersistedVisibilityStates and saveItemVisibilityState functions removed.

// populateSettingsMenu function removed.

// toggleSettingsMenu function and call count variable removed.

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function () {
  // Event delegation for skinny bar button clicks
  if (skinnyBar) {
    skinnyBar.addEventListener('click', function(event) {
      const noraStyle = document.getElementById('nora-kim-content')?.style.display;
      const zoeStyle = document.getElementById('zoe-brooks-content')?.style.display;
      console.log(`[SkinnyBar Click - Entry] Nora style: ${noraStyle}, Zoe style: ${zoeStyle}`);
        const clickedButton = event.target.closest('button.skinny-bar-item');
        if (!clickedButton) return;

        const buttonId = clickedButton.id;
        const viewId = clickedButton.dataset.viewId;

        if (buttonId === 'skinny-bar-add-btn') {
            console.log('[Event Delegated] Add clicked');
        } else if (buttonId === 'skinny-bar-gmail-btn') {
            console.log('[Event Delegated] Gmail clicked');
        } else if (viewId) { // Handles all app buttons with a data-view-id, including skinny-bar-salesforce-btn
            // Assumed original logic for skinny bar app buttons
            if (!rightSidebar.classList.contains('hidden') && currentRightSidebarViewId === viewId && activeSkinnyBarButtonId === buttonId) {
                console.log(`[SkinnyBar SF Click - Close Logic] Closing sidebar. currentRightSidebarViewId: ${currentRightSidebarViewId}, activeSkinnyBarButtonId: ${activeSkinnyBarButtonId}`);
                rightSidebar.classList.add('hidden');
                currentRightSidebarViewId = null;
                updateActiveSkinnyButtonState(null);
            } else {
                updateActiveSkinnyButtonState(buttonId);
                const activeMainView = document.getElementById('nora-kim-content')?.style.display === 'block' ? 'Nora' : (document.getElementById('zoe-brooks-content')?.style.display === 'block' ? 'Zoe' : 'Other/Inbox');
                // Use currentMainView state variable instead of checking DOM display style
                const salesforceContext = (currentMainView === 'zoeBrooks') ? 'no-contact-matched' : 'contact-matched';
                console.log(`[SkinnyBar SF Click - Re-Open Logic] currentMainView: ${currentMainView}, Determined SF Context: ${salesforceContext}`);
                showRightSidebarViewContent(viewId, salesforceContext);
            }
        }
    });

    // Drag and drop listeners for the container
    skinnyBar.addEventListener('dragover', onDragOver);
    skinnyBar.addEventListener('drop', onDrop);
  }

  // Close settings menu on outside click
  // document.addEventListener('click', (event) => {
  //   if (settingsMenuElement && settingsMenuElement.classList.contains('settings-menu--open')) {
  //     if (!settingsMenuElement.contains(event.target) && event.target !== settingsBtnElement && !settingsBtnElement.contains(event.target)) {
  //       toggleSettingsMenu();
  //     }
  //   }
  // });
  
  // SFDC Login button (dynamic content)
  document.body.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'connect-salesforce-btn') {
      console.log('[Banner #connect-salesforce-btn CLICKED]');
      isSalesforceLoggedIn = true;
      // 1. Ensure Nora Kim's main content is shown and sidebar is visible
      showMainView('noraKim'); 
      
      // 2. Directly load Nora Kim's contact-matched view in the Salesforce app within the right sidebar
      // The 'contact-matched' context in showRightSidebarViewContent will lead loadSalesforcePage
      // to load 'salesforce-login-nora.html'.
      showRightSidebarViewContent('right-view-salesforce', 'contact-matched');

      // 3. Activate the Salesforce button in the skinny bar
      updateActiveSkinnyButtonState('skinny-bar-salesforce-btn');
      
      // Ensure the right sidebar is visible (showMainView('noraKim') should do this, but as a safeguard)
      if (rightSidebar && rightSidebar.classList.contains('hidden')) {
        rightSidebar.classList.remove('hidden');
      }
      if (skinnyBar && skinnyBar.classList.contains('hidden')) {
        skinnyBar.classList.remove('hidden');
      }
    }
  });

  // Initial setup
  loadAndApplySkinnyBarOrder();
  skinnyBar.querySelectorAll('button.skinny-bar-item').forEach(button => {
      button.style.display = ''; // Set display to default (visible)
      button.draggable = true;    // Make it draggable
      // Add drag listeners after order and visibility are set
      manageDragListeners(button, true); // Pass true for isDraggable
  });
  
  showMainView('inbox'); // Start with inbox view

  // Delegated event listeners for dynamically loaded Salesforce login buttons
  document.getElementById('right-sidebar')?.addEventListener('click', function(event) {
    const connectButton = event.target.closest('.sfdc-connect-btn');
    if (connectButton) {
      const targetPage = connectButton.dataset.targetpage;
      if (targetPage) {
        isSalesforceLoggedIn = true;
        loadSalesforcePage(targetPage);
      } else {
        console.error('Connect button clicked, but data-targetpage attribute is missing or empty.');
      }
    }
  });

  const gmailBtn = document.getElementById('skinny-bar-gmail-btn');
  if (gmailBtn) {
    gmailBtn.classList.add('pulsate-animation');
    gmailBtn.addEventListener('mouseenter', () => gmailBtn.classList.remove('pulsate-animation'), { once: true });
  }
});
