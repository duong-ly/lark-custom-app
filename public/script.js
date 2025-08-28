// Lark Embed Client Application (Plain JavaScript)

// Constants
const EXP_CHECK_INTERVAL_MS = 60 * 1000;
const CRITICAL_TTL_MS = 3 * 60 * 1000;

// Application state
let state = {
  tokenExpiration: 0,
  currentToken: "",
  currentAuthCode: "",
  userInfo: null,
  currentUrl: ""
};

// Utility functions
const statusEl = () => document.getElementById("status");
const statusContainerEl = () => document.getElementById("status-container");
const iframeEl = () => document.getElementById("embedded-iframe");

const showStatusPanel = (message, isError = false) => {
  const container = statusContainerEl();
  const iframe = iframeEl();
  if (container) container.style.display = 'flex';
  if (iframe) iframe.classList.remove('ready');
  updateStatus(message, isError);
};

const showIframePanel = () => {
  const container = statusContainerEl();
  const iframe = iframeEl();
  if (container) container.style.display = 'none';
  if (iframe) iframe.classList.add('ready');
};

const updateStatus = (message, isError = false) => {
  const el = statusEl();
  if (el) {
    el.textContent = message;
    el.style.color = isError ? '#dc3545' : '#28a745';
  }
  console.log(`Status: ${message}`);
};

const logError = (message, error) => {
  console.error(`[LarkEmbed] ERROR: ${message}`, error || '');
};

const updateUserInfoUI = (userInfo) => {
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');

  if (nameEl) nameEl.textContent = userInfo?.name || 'Unknown';
  if (emailEl) emailEl.textContent = userInfo?.email || 'Unknown';
}
/**
 * Initialize Lark SDK and get authorization code
 */
async function initLarkSDK() {
  return new Promise(async (resolve, reject) => {
    try {
      // Get app ID and JSAPI config
      const appIdResponse = await fetch('/get_app_id');
      const appId = await appIdResponse.text();

      const configResponse = await fetch(`/get_config_parameters?url=${encodeURIComponent(window.location.href)}`);
      const configParams = await configResponse.json();

      // Initialize H5SDK with config parameters
      window.h5sdk.config({
        appId: configParams.appid,
        timestamp: configParams.timestamp,
        nonceStr: configParams.noncestr,
        signature: configParams.signature,
        jsApiList: ['requestAuthCode']
      });

      // Handle SDK errors
      window.h5sdk.error((err) => {
        logError('H5SDK error:', JSON.stringify(err));
        reject(new Error('H5SDK initialization failed: ' + JSON.stringify(err)));
      });

      // Wait for SDK ready
      window.h5sdk.ready(() => {
        // Request authorization code
        window.tt.requestAccess({
          appID: appId,
          scopeList: [],
          success: async (res) => {
            state.currentAuthCode = res.code;
            // Get user info
            try {
              const userInfoResponse = await fetch(`/get_user_info?code=${encodeURIComponent(res.code)}`);
              state.userInfo = await userInfoResponse.json();
              // Update UI
              updateUserInfoUI(state.userInfo);
              resolve(state.userInfo);
            } catch (error) {
              logError("Failed to get user info:", error);
              reject(error);
            }
          },
          fail: (err) => {
            logError("Failed to get authorization code:", JSON.stringify(err));
            reject(new Error('Failed to get authorization code: ' + JSON.stringify(err)));
          }
        });
      });
    } catch (error) {
      logError("SDK initialization error:", error);
      reject(error);
    }
  });
}

/**
 * Load the embed with authentication
 */
async function loadEmbed() {
  try {
    showStatusPanel("Initializing Lark SDK...");

    // Initialize Lark SDK and get authorization code
    const userInfo = await initLarkSDK();

    showStatusPanel("Loading embed...");

    // Get embed URL with the authorization code
    const res = await fetch(`/api/embed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userInfo: userInfo })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to get embed URL");
    }

    // Update iframe and state
    const iframe = iframeEl();
    if (iframe) {
      // When iframe finishes loading, show it and hide status
      iframe.onload = () => {
        showIframePanel();
      };
      iframe.src = data.url;
    }

    state.currentToken = data.token;
    state.tokenExpiration = data.exp;
    state.currentUrl = data.url;

    // Enable and wire Open Dashboard button
    const openBtn = document.getElementById('open-dashboard-btn');
    if (openBtn) {
      openBtn.disabled = false;
      openBtn.addEventListener('click', () => {
        if (state.currentUrl) {
          window.open(state.currentUrl, '_blank', 'noopener');
        }
      }, { once: true });
    }
  } catch (error) {
    logError("Load embed error:", error);
    updateStatus("Error: " + error.message, true);
    // Keep status panel visible to show error
    showStatusPanel("Error: " + error.message, true);
    throw error;
  }
}

/**
 * Refresh the embed token
 */
async function refreshToken() {
  if (!state.currentAuthCode) {
    logError("No auth code available for refresh");
    return;
  }

  try {
    const res = await fetch(`/api/embed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userInfo: state.userInfo })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to refresh token");
    }

    state.currentToken = data.token;
    state.tokenExpiration = data.exp;

    // Notify embedded iframe of new token
    const iframe = iframeEl();
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "refresh_token", token: data.token },
        "*" // Allow any origin for the embedded content
      );
    }

    updateStatus("Token refreshed");
  } catch (error) {
    logError("Token refresh failed:", error);
    updateStatus("Token refresh failed", true);
  }
}

/**
 * Check token expiration and refresh if needed
 */
function checkExpAndRefreshToken() {
  const ttl = state.tokenExpiration * 1000 - Date.now();
  if (ttl <= CRITICAL_TTL_MS) {
    refreshToken().catch(console.error);
  }
}

// Event listeners
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkExpAndRefreshToken();
});

// Periodic token expiration check
setInterval(checkExpAndRefreshToken, EXP_CHECK_INTERVAL_MS);

// Global error handler
window.addEventListener('error', (event) => {
  logError('Global error', event.error);
});

// Start the application with status container visible
showStatusPanel("Starting...");
loadEmbed().catch((err) => {
  logError("Application error:", err);
  updateStatus("Error: " + err.message, true);
});