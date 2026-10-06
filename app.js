/**
 * ====================================================================
 * DIGITAL DETECTIVE - APPLICATION LOGIC (app.js)
 * ====================================================================
 * This script powers the interactive detective experience:
 * 1. State Management (tracks inspected clues & user selection)
 * 2. DOM Rendering (populates case dossier, suspects, evidence cards)
 * 3. Interactive Clue Inspector Modal (reveals logs & chat transcripts)
 * 4. Suspect Accusation & Verdict Evaluation (compares against solution)
 * 5. Reset & Replay handling
 * 
 * Each function is documented with beginner-friendly explanations!
 */

// --- 1. APPLICATION STATE ---
// We store simple in-memory state variables here (no database required!)
const gameState = {
  activeTab: "dossier-tab",
  examinedClueIds: new Set(), // Set tracks unique clues the player has opened
  selectedSuspectId: null,    // Tracks who the player clicked to accuse
  currentFilter: "all",       // Clue filter: 'all', 'chat', 'log', 'alibi'
  tutorialStep: 1             // Guided investigation step: 1, 2, 3, 4
};

// --- 2. INITIALIZATION ON DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/**
 * Main setup function that runs when the web page loads.
 */
function initApp() {
  populateCaseDossier();
  renderChecklist();
  renderEvidence();
  renderSuspects();
  renderAccuseChoices();
  setupEventListeners();
  updateProgressUI();
  renderTutorialStep();
}

// --- 3. POPULATE CASE BRIEFING & DOSSIER ---
function populateCaseDossier() {
  // Case metadata & overview
  document.getElementById("case-id-display").textContent = CURRENT_CASE.id;
  document.getElementById("case-title").textContent = CURRENT_CASE.title;
  document.getElementById("case-subtitle").textContent = CURRENT_CASE.subtitle;
  document.getElementById("incident-timestamp").textContent = CURRENT_CASE.date;
  
  // Incident details
  document.getElementById("case-summary-text").textContent = CURRENT_CASE.briefing.summary;
  document.getElementById("case-target-asset").textContent = CURRENT_CASE.briefing.stolenAsset;
  document.getElementById("case-location").textContent = CURRENT_CASE.location;
  document.getElementById("case-difficulty").textContent = CURRENT_CASE.difficulty;
  document.getElementById("case-detective-notes").textContent = CURRENT_CASE.briefing.investigatorNotes;
  
  // Total clue counts
  document.getElementById("evidence-count").textContent = CURRENT_CASE.clues.length;
}

// --- 4. RENDER EVIDENCE CARDS ---
function renderEvidence() {
  const container = document.getElementById("evidence-container");
  container.innerHTML = "";

  // Filter clues based on player's chosen filter pill
  const filteredClues = CURRENT_CASE.clues.filter(clue => {
    if (gameState.currentFilter === "all") return true;
    if (gameState.currentFilter === "chat") return clue.type === "chat";
    if (gameState.currentFilter === "log") return clue.type === "log" || clue.type === "terminal";
    if (gameState.currentFilter === "alibi") return clue.type === "alibi" || clue.type === "hardware";
    return true;
  });

  filteredClues.forEach((clue, index) => {
    const isExamined = gameState.examinedClueIds.has(clue.id);

    const card = document.createElement("div");
    card.className = `evidence-card ${isExamined ? "examined" : ""}`;
    card.id = `card-${clue.id}`;
    
    // Choose badge color based on type
    const badgeColor = clue.type === "chat" ? "tag-purple" : (clue.type === "log" || clue.type === "terminal" ? "tag-cyan" : "tag-amber");

    card.innerHTML = `
      <div>
        <div class="clue-top-meta">
          <span class="tag-pill ${badgeColor}">${clue.badge}</span>
          <span class="meta-label">#0${index + 1}</span>
        </div>
        <h3 class="clue-title">${clue.title}</h3>
        <p class="clue-summary-preview">${clue.shortDescription}</p>
      </div>
      <div class="evidence-card-footer">
        <span class="inspect-cue">Click to Decrypt File →</span>
        ${isExamined ? `<span class="examined-badge">✓ Analyzed</span>` : `<span class="meta-label">Unopened</span>`}
      </div>
    `;

    // Click handler to open the forensic inspection modal
    card.addEventListener("click", () => {
      openClueModal(clue);
    });

    container.appendChild(card);
  });
}

// --- 5. RENDER SUSPECTS LIST ---
function renderSuspects() {
  const container = document.getElementById("suspects-container");
  container.innerHTML = "";

  CURRENT_CASE.suspects.forEach(suspect => {
    const card = document.createElement("div");
    card.className = "suspect-card";

    card.innerHTML = `
      <div class="suspect-header">
        <div class="suspect-avatar">${suspect.avatar}</div>
        <div>
          <h3 class="suspect-name">${suspect.name}</h3>
          <span class="suspect-role">${suspect.role}</span>
        </div>
      </div>

      <div class="suspect-info-block">
        <div class="info-item">
          <span class="info-label">Potential Motive</span>
          <p class="info-text">${suspect.motive}</p>
        </div>
        <div class="info-item">
          <span class="info-label">Stated Alibi</span>
          <p class="info-text">${suspect.alibi}</p>
        </div>
        <div class="info-item">
          <span class="info-label">Initial Suspicion Level</span>
          <p class="info-text">${suspect.suspicionLevel}</p>
        </div>
        <div class="info-item">
          <span class="info-label">Direct Statement</span>
          <p class="suspect-quote">${suspect.quote}</p>
        </div>
      </div>

      <div class="suspect-action">
        <button class="btn btn-secondary btn-block" onclick="selectSuspectForAccusation('${suspect.id}')">
          Select for Accusation Tribunal →
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// --- 6. RENDER ACCUSATION CHOICES (Radio Cards) ---
function renderAccuseChoices() {
  const container = document.getElementById("accuse-suspect-choices");
  container.innerHTML = "";

  CURRENT_CASE.suspects.forEach(suspect => {
    const isSelected = gameState.selectedSuspectId === suspect.id;

    const choice = document.createElement("div");
    choice.className = `accuse-choice ${isSelected ? "selected" : ""}`;
    choice.id = `accuse-choice-${suspect.id}`;

    choice.innerHTML = `
      <div class="accuse-radio"></div>
      <div class="accuse-choice-avatar">${suspect.avatar}</div>
      <div class="accuse-choice-details">
        <span class="accuse-choice-name">${suspect.name}</span>
        <span class="accuse-choice-role">${suspect.role}</span>
      </div>
    `;

    choice.addEventListener("click", () => {
      chooseSuspect(suspect.id);
    });

    container.appendChild(choice);
  });
}

/**
 * Handles picking a suspect in the Accuse tribunal screen.
 */
function chooseSuspect(suspectId) {
  gameState.selectedSuspectId = suspectId;
  renderAccuseChoices();

  const submitBtn = document.getElementById("submit-verdict-btn");
  const chosenSuspect = CURRENT_CASE.suspects.find(s => s.id === suspectId);

  submitBtn.disabled = false;
  submitBtn.innerHTML = `⚡ Accuse <strong>${chosenSuspect.name}</strong> & Finalize Verdict`;
}

/**
 * Convenience helper to jump directly from a Suspect Card to the Accusation tab.
 */
function selectSuspectForAccusation(suspectId) {
  chooseSuspect(suspectId);
  switchTab("accuse-tab");
}

// --- 7. CHECKLIST & PROGRESS TRACKER ---
function renderChecklist() {
  const container = document.getElementById("checklist-container");
  container.innerHTML = "";

  CURRENT_CASE.clues.forEach((clue, index) => {
    const isDone = gameState.examinedClueIds.has(clue.id);
    const li = document.createElement("li");
    li.className = `checklist-item ${isDone ? "done" : ""}`;
    li.innerHTML = `
      <span class="check-icon">${isDone ? "✓" : "○"}</span>
      <span>Clue #${index + 1}: ${clue.typeLabel}</span>
    `;
    container.appendChild(li);
  });
}

function updateProgressUI() {
  const total = CURRENT_CASE.clues.length;
  const examinedCount = gameState.examinedClueIds.size;
  const percentage = Math.round((examinedCount / total) * 100);

  // Update top tracker
  document.getElementById("clue-tracker").textContent = `${examinedCount} / ${total}`;

  // Update dossier sidebar progress
  document.getElementById("progress-percent-label").textContent = `${percentage}%`;
  document.getElementById("progress-bar-fill").style.width = `${percentage}%`;

  // Update HUD telemetry if present
  const hudClues = document.getElementById("hud-clues-count");
  if (hudClues) hudClues.textContent = `${examinedCount} / ${total}`;

  // Update checklist items
  renderChecklist();
}

// --- 8. FORENSIC CLUE INSPECTOR MODAL ---
function openClueModal(clue) {
  // Mark clue as examined in state
  gameState.examinedClueIds.add(clue.id);

  // Populate modal data
  document.getElementById("modal-clue-badge").textContent = clue.badge;
  document.getElementById("modal-clue-id").textContent = clue.id.toUpperCase();
  document.getElementById("modal-clue-title").textContent = clue.title;
  document.getElementById("modal-clue-summary").textContent = clue.shortDescription;
  document.getElementById("modal-clue-content").textContent = clue.detailContent.trim();
  document.getElementById("modal-terminal-header").textContent = `${clue.id}_forensic_data.log`;

  // Open the modal backdrop
  const modal = document.getElementById("clue-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  // Refresh UI to show the card as examined
  renderEvidence();
  updateProgressUI();
}

function closeClueModal() {
  const modal = document.getElementById("clue-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

// --- 9. ACCUSATION EVALUATION & VERDICT MODAL ---
function evaluateAccusation() {
  if (!gameState.selectedSuspectId) return;

  const isCorrect = gameState.selectedSuspectId === CURRENT_CASE.solution.culpritId;
  const chosenSuspect = CURRENT_CASE.suspects.find(s => s.id === gameState.selectedSuspectId);
  const actualCulprit = CURRENT_CASE.suspects.find(s => s.id === CURRENT_CASE.solution.culpritId);

  const verdictModal = document.getElementById("verdict-modal");
  const verdictBanner = document.getElementById("verdict-banner");
  const verdictIcon = document.getElementById("verdict-icon");
  const verdictStatusTitle = document.getElementById("verdict-status-title");
  const culpritCard = document.getElementById("verdict-culprit-card");
  const breakdownList = document.getElementById("verdict-breakdown-list");
  const retryBtn = document.getElementById("retry-btn");

  if (isCorrect) {
    // --- SUCCESS CASE ---
    verdictBanner.className = "verdict-banner solved";
    verdictIcon.textContent = "🎯";
    verdictStatusTitle.textContent = "CASE SOLVED! PERPETRATOR APPREHENDED";

    culpritCard.innerHTML = `
      <p class="culprit-summary-text">Guilty: ${actualCulprit.name} (${actualCulprit.role})</p>
      <p class="culprit-desc">${CURRENT_CASE.solution.summary}</p>
    `;

    // Populate forensic proof breakdown
    breakdownList.innerHTML = CURRENT_CASE.solution.breakdown.map(item => `
      <div class="breakdown-item">
        <div class="breakdown-clue-title">${item.clue}</div>
        <div class="breakdown-clue-text">${item.detail}</div>
      </div>
    `).join("");

    retryBtn.style.display = "none";

    // Update status badge on header
    const statusText = document.getElementById("status-badge-text");
    if (statusText) statusText.textContent = "CASE CLOSED // SOLVED";
    const hudState = document.getElementById("hud-case-state");
    if (hudState) {
      hudState.textContent = "SOLVED";
      hudState.style.color = "#34d399";
    }
  } else {
    // --- INCORRECT ACCUSATION CASE ---
    verdictBanner.className = "verdict-banner failed";
    verdictIcon.textContent = "❌";
    verdictStatusTitle.textContent = "INCORRECT ACCUSATION";

    let wrongExplanation = "";
    if (chosenSuspect.id === "suspect-elena") {
      wrongExplanation = 
        "You accused Elena Vance because her user credentials were used. However, Clue #5 proves her personal laptop had 0.0W power draw (shut down), and Clue #1 reveals the physical MAC address on the VPN tunnel was Marcus's lab machine. Elena was framed!";
    } else if (chosenSuspect.id === "suspect-chloe") {
      wrongExplanation = 
        "You accused Chloe Torres due to her startup motive. However, Clue #6 confirms her ironclad alibi: she was on stage at the Metropolis Hackathon, live on Twitch and pushing verifiable public git commits during the exact time of the breach!";
    }

    culpritCard.innerHTML = `
      <p class="culprit-summary-text" style="color: #f87171;">Falsely Accused: ${chosenSuspect.name}</p>
      <p class="culprit-desc">${wrongExplanation}</p>
    `;

    breakdownList.innerHTML = `
      <div class="breakdown-item" style="border-left-color: #ef4444;">
        <div class="breakdown-clue-title" style="color: #f87171;">Investigator Advice</div>
        <div class="breakdown-clue-text">
          Re-examine Clues #1, #3, and #5. Notice how the stolen credentials were deliberately routed through a different hardware machine and external IP address.
        </div>
      </div>
    `;

    retryBtn.style.display = "inline-flex";
  }

  // Display modal
  verdictModal.classList.add("open");
  verdictModal.setAttribute("aria-hidden", "false");
}

function closeVerdictModal() {
  const verdictModal = document.getElementById("verdict-modal");
  verdictModal.classList.remove("open");
  verdictModal.setAttribute("aria-hidden", "true");
}

/**
 * Resets case state to start fresh.
 */
function resetCase() {
  gameState.examinedClueIds.clear();
  gameState.selectedSuspectId = null;
  gameState.currentFilter = "all";

  // Reset UI elements
  closeVerdictModal();
  closeStatusModal();
  switchTab("dossier-tab");
  renderEvidence();
  renderSuspects();
  renderAccuseChoices();
  updateProgressUI();

  const submitBtn = document.getElementById("submit-verdict-btn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = "🔒 Select a Suspect to Deliver Verdict";

  const statusText = document.getElementById("status-badge-text");
  if (statusText) statusText.textContent = "INVESTIGATION ACTIVE";
  const hudState = document.getElementById("hud-case-state");
  if (hudState) {
    hudState.textContent = "IN PROGRESS";
    hudState.style.color = "#34d399";
  }
}

// --- 10. TAB NAVIGATION HELPER ---
function switchTab(tabId) {
  // Update nav buttons
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Update content sections
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add("active-content");
    } else {
      content.classList.remove("active-content");
    }
  });

  gameState.activeTab = tabId;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- 11. EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Tab switching buttons
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Evidence filter buttons
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.currentFilter = btn.getAttribute("data-filter");
      renderEvidence();
    });
  });

  // Modal close button
  document.getElementById("modal-close-btn").addEventListener("click", closeClueModal);

  // Close modals on clicking outside window
  window.addEventListener("click", (e) => {
    const clueModal = document.getElementById("clue-modal");
    if (e.target === clueModal) {
      closeClueModal();
    }
  });

  // Accusation verdict submit button
  document.getElementById("submit-verdict-btn").addEventListener("click", evaluateAccusation);

  // Close tutorial modal on outside click
  window.addEventListener("click", (e) => {
    const tutorialModal = document.getElementById("tutorial-modal");
    if (e.target === tutorialModal) {
      closeTutorial();
    }
    const statusModal = document.getElementById("status-modal");
    if (e.target === statusModal) {
      closeStatusModal();
    }
  });
}

// ====================================================================
// --- 12. GUIDED INVESTIGATION / DETECTIVE TUTORIAL ENGINE ---
// ====================================================================

/**
 * Tutorial step definitions.
 * Provides clear onboarding guidance for players starting the case.
 */
const TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Welcome Detective: Read the Case",
    instruction: "Welcome Detective. Step 1: Read the case. First understand what happened and what you are investigating.",
    previewHtml: `
      <div class="preview-title">Case Briefing Preview</div>
      <div style="font-size: 0.95rem; color: #f8fafc; font-weight: 700; margin-bottom: 0.35rem;">
        Operation Ghost Query (CASE-204)
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">
        Target: <span style="color:#38bdf8;">Apex Financial Data Vault</span> • 
        Asset: <span style="color:#f59e0b;">Encrypted User Database</span> • 
        Incident: <span style="color:#f87171;">Breached via Emergency VPN Token</span>
      </div>
    `
  },
  {
    step: 2,
    title: "Meet the Suspects",
    instruction: "Step 2: Meet the suspects. Review their profiles, motives, and alibis.",
    previewHtml: `
      <div class="preview-title">Persons of Interest Lineup</div>
      <div class="preview-grid-3">
        <div class="preview-item-chip">
          <span class="chip-icon">👩‍💻</span>
          <span class="chip-label">Elena Vance</span>
          <span style="font-size:0.7rem; color:#38bdf8;">Lead DBA</span>
        </div>
        <div class="preview-item-chip">
          <span class="chip-icon">🕵️‍♂️</span>
          <span class="chip-label">Marcus Chen</span>
          <span style="font-size:0.7rem; color:#f59e0b;">Pen Tester</span>
        </div>
        <div class="preview-item-chip">
          <span class="chip-icon">👩‍🔬</span>
          <span class="chip-label">Chloe Torres</span>
          <span style="font-size:0.7rem; color:#c084fc;">Cloud Architect</span>
        </div>
      </div>
    `
  },
  {
    step: 3,
    title: "Investigate the Evidence",
    instruction: "Step 3: Investigate the evidence. Open each piece of evidence and look for connections.",
    previewHtml: `
      <div class="preview-title">Forensic Clues & Transcripts</div>
      <div class="preview-grid-3">
        <div class="preview-item-chip">
          <span class="chip-icon">💬</span>
          <span class="chip-label">Chat Logs</span>
          <span style="font-size:0.7rem; color:#38f8cf;">Slack & Dark DM</span>
        </div>
        <div class="preview-item-chip">
          <span class="chip-icon">💻</span>
          <span class="chip-label">System Logs</span>
          <span style="font-size:0.7rem; color:#38f8cf;">Bash & MAC Trace</span>
        </div>
        <div class="preview-item-chip">
          <span class="chip-icon">⚡</span>
          <span class="chip-label">Telemetry</span>
          <span style="font-size:0.7rem; color:#38f8cf;">Alibis & Power Draw</span>
        </div>
      </div>
    `
  },
  {
    step: 4,
    title: "Make Your Accusation",
    instruction: "Step 4: Make your accusation. Once you have gathered enough information, choose who you believe is responsible.",
    previewHtml: `
      <div class="preview-title">Tribunal Verdict Ready</div>
      <div style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0;">
        <span style="font-size: 2.2rem;">⚖️</span>
        <div style="font-size: 0.88rem; color: #fde68a; line-height: 1.5;">
          Once your investigation is complete, lock in your verdict to reveal whether you identified the real culprit or got deceived by a coverup!
        </div>
      </div>
    `
  }
];

/**
 * Renders the active step inside the Guided Tutorial modal.
 */
function renderTutorialStep() {
  const current = TUTORIAL_STEPS[gameState.tutorialStep - 1];
  if (!current) return;

  // Update step indicators
  document.getElementById("tutorial-step-badge").textContent = `STEP ${current.step} OF 4`;
  document.getElementById("tutorial-step-title").textContent = current.title;
  document.getElementById("tutorial-instruction-text").textContent = current.instruction;
  document.getElementById("tutorial-preview-card").innerHTML = current.previewHtml;

  // Update Stepper dots
  const stepDots = document.querySelectorAll(".step-dot");
  const stepLines = document.querySelectorAll(".step-line");

  stepDots.forEach(dot => {
    const stepNum = parseInt(dot.getAttribute("data-step"), 10);
    dot.classList.remove("active", "completed");
    if (stepNum === gameState.tutorialStep) {
      dot.classList.add("active");
    } else if (stepNum < gameState.tutorialStep) {
      dot.classList.add("completed");
    }
  });

  stepLines.forEach((line, index) => {
    // line index 0 is between step 1 and 2
    if (index + 1 < gameState.tutorialStep) {
      line.classList.add("completed");
    } else {
      line.classList.remove("completed");
    }
  });

  // Buttons visibility & states
  const backBtn = document.getElementById("tutorial-back-btn");
  const nextBtn = document.getElementById("tutorial-next-btn");
  const startBtn = document.getElementById("tutorial-start-btn");

  // Step 1 has no "Back" button
  if (gameState.tutorialStep === 1) {
    backBtn.style.visibility = "hidden";
  } else {
    backBtn.style.visibility = "visible";
  }

  // On step 4, replace "Next" with "Start Investigation"
  if (gameState.tutorialStep === 4) {
    nextBtn.style.display = "none";
    startBtn.style.display = "inline-flex";
  } else {
    nextBtn.style.display = "inline-flex";
    startBtn.style.display = "none";
  }
}

/**
 * Move forward in the guided tutorial
 */
function nextTutorialStep() {
  if (gameState.tutorialStep < 4) {
    gameState.tutorialStep++;
    renderTutorialStep();
  }
}

/**
 * Move backward in the guided tutorial
 */
function prevTutorialStep() {
  if (gameState.tutorialStep > 1) {
    gameState.tutorialStep--;
    renderTutorialStep();
  }
}

/**
 * Open or reopen the guided tutorial from any view
 */
function openTutorial() {
  gameState.tutorialStep = 1;
  renderTutorialStep();
  const modal = document.getElementById("tutorial-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

/**
 * Close the tutorial overlay
 */
function closeTutorial() {
  const modal = document.getElementById("tutorial-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

/**
 * Action triggered on "Start Investigation"
 * Closes tutorial, navigates to the Case Dossier, and scrolls to top.
 */
function startInvestigation() {
  closeTutorial();
  switchTab("dossier-tab");
}

// ====================================================================
// --- 13. CASE STATUS & MISSION HUD MODAL ---
// ====================================================================

/**
 * Opens the Mission HUD showing live progress and case objective.
 */
function openStatusModal() {
  updateProgressUI();
  const modal = document.getElementById("status-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

/**
 * Closes the Mission HUD modal.
 */
function closeStatusModal() {
  const modal = document.getElementById("status-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}


