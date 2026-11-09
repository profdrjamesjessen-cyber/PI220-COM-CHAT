(() => {
"use strict";

const cfg = window.PI220_CONFIG || {};
const $ = id => document.getElementById(id);
let db, currentUser, activeRoom = null, roomRows = [], channel = null, sending = false;
let roomLoadToken = 0;
let profileNames = Object.create(null);
let unreadMessages = 0;
let mode = "login";

const authPanel = $("authPanel");
const chatApp = $("chatApp");
const messageBox = $("message");

function say(el, text, error = false) {
  el.textContent = text || "";
  el.classList.toggle("error", !!error);
}
function status(text, ready = false) {
  $("connectionStatus").textContent = text;
  $("connectionIndicator").classList.toggle("ready", !!ready);
}
function setLiveStatus(text, ready = false) {
  $("liveStatus").textContent = text;
  $("liveIndicator").classList.toggle("ready", !!ready);
}
function setFeedback(text, type = "") {
  const el = $("sendFeedback");
  el.textContent = text || "";
  el.classList.toggle("error", type === "error");
  el.classList.toggle("success", type === "success");
}
function setMode(next) {
  mode = next;
  const registering = mode === "register";
  $("loginTab").classList.toggle("active", !registering);
  $("registerTab").classList.toggle("active", registering);
  $("nameLabel").classList.toggle("hidden", !registering);
  $("displayName").required = registering;
  $("formTitle").textContent = registering ? "Create your account." : "Welcome back.";
  $("formIntro").textContent = registering
    ? "Register to join PI220 COMMUNICATIONS."
    : "Sign in with your registered email address.";
  $("password").autocomplete = registering ? "new-password" : "current-password";
  $("resetButton").classList.toggle("hidden", registering);
  $("submitButton").innerHTML = registering ? 'CREATE ACCOUNT <span>→</span>' : 'SIGN IN <span>→</span>';
  say(messageBox, "");
}
function showAuth() {
  chatApp.classList.add("hidden");
  authPanel.classList.remove("hidden");
}
function showChat(user) {
  currentUser = user;
  authPanel.classList.add("hidden");
  chatApp.classList.remove("hidden");
}
function timeLabel(value) {
  return new Date(value).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}
function friendlySendError(err) {
  const msg = String(err?.message || "Unknown error");
  if (/Duplicate message rejected/i.test(msg)) {
    return "Duplicate message blocked. You can send that message again after 60 seconds.";
  }
  if (/Message rate limit exceeded/i.test(msg)) {
    return "You're sending messages too quickly. Please wait a few seconds and try again.";
  }
  if (/Invalid message sender|row-level security|permission denied/i.test(msg)) {
    return "Your account is not authorized to send this message to the selected channel.";
  }
  if (/network|fetch/i.test(msg)) {
    return "Connection problem. Your message was not sent. Check your connection and retry.";
  }
  return "Message not sent: " + msg;
}
function updateCharacterCount() {
  $("characterCount").textContent = $("messageInput").value.length.toLocaleString() + " / 5,000";
}
function resizeComposer() {
  const input = $("messageInput");
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 132) + "px";
}
function nearBottom(area) {
  return area.scrollHeight - area.scrollTop - area.clientHeight < 90;
}
function updateUnreadButton() {
  const button = $("newMessagesButton");
  if (!unreadMessages) {
    button.classList.add("hidden");
    return;
  }
  button.textContent = "↓ " + unreadMessages + (unreadMessages === 1 ? " NEW MESSAGE" : " NEW MESSAGES");
  button.classList.remove("hidden");
}
function scrollToLatest() {
  const area = $("messages");
  area.scrollTop = area.scrollHeight;
  unreadMessages = 0;
  updateUnreadButton();
}
function resetMessageStage(text = "Select a channel to enter the conversation.") {
  const area = $("messages");
  area.replaceChildren();
  const empty = document.createElement("div");
  empty.className = "empty-state";
  const logo = document.createElement("span");
  logo.className = "empty-symbol";
  logo.innerHTML = 'PI<span>220</span>';
  const heading = document.createElement("b");
  heading.textContent = "WELCOME TO COMMUNICATIONS";
  const detail = document.createElement("p");
  detail.textContent = text;
  empty.append(logo, heading, detail);
  area.append(empty);
  unreadMessages = 0;
  updateUnreadButton();
}
function makeMessageNode(row) {
  const item = document.createElement("article");
  item.className = "message-item";
  item.dataset.messageId = row.id;

  const head = document.createElement("div");
  head.className = "message-meta";
  const author = document.createElement("strong");
  author.textContent = profileNames[row.sender_id] ||
    (row.sender_id === currentUser?.id ? "You" : "PI220 Member");
  const time = document.createElement("time");
  time.dateTime = row.created_at;
  time.textContent = timeLabel(row.created_at);
  const body = document.createElement("p");
  body.textContent = row.body;

  head.append(author, time);
  item.append(head, body);
  return item;
}
async function ensureProfileName(senderId) {
  if (profileNames[senderId]) return;
  if (senderId === currentUser?.id) {
    profileNames[senderId] = "You";
    return;
  }
  const { data, error } = await db.from("profiles")
    .select("id,display_name").eq("id", senderId).maybeSingle();
  if (!error && data) profileNames[data.id] = data.display_name || "PI220 Member";
}
async function appendMessage(row, options = {}) {
  const area = $("messages");
  if (!row || !row.id || area.querySelector('[data-message-id="' + CSS.escape(row.id) + '"]')) return;

  const shouldFollow = options.forceScroll === true || nearBottom(area);
  const empty = area.querySelector(".empty-state");
  if (empty) empty.remove();

  await ensureProfileName(row.sender_id);
  const node = makeMessageNode(row);
  area.append(node);

  if (shouldFollow) {
    requestAnimationFrame(scrollToLatest);
  } else {
    unreadMessages += 1;
    updateUnreadButton();
  }
}
async function loadRooms() {
  const { data, error } = await db.from("chat_rooms")
    .select("id,name,slug,description,is_public")
    .eq("is_public", true)
    .order("name");
  if (error) throw error;

  roomRows = data || [];
  $("roomCount").textContent = String(roomRows.length).padStart(2, "0");
  renderRoomList();
}
function renderRoomList() {
  const list = $("roomList");
  const query = $("roomSearch").value.trim().toLowerCase();
  list.replaceChildren();

  const visible = roomRows.filter(room => room.name.toLowerCase().includes(query));
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "muted pad";
    empty.textContent = "No matching channels.";
    list.append(empty);
    return;
  }

  visible.forEach(room => {
    const button = document.createElement("button");
    button.className = "room-button" + (activeRoom?.id === room.id ? " active" : "");
    button.type = "button";
    button.setAttribute("aria-current", activeRoom?.id === room.id ? "page" : "false");
    const symbol = document.createElement("span");
    symbol.className = "room-symbol";
    symbol.textContent = "#";
    const name = document.createElement("span");
    name.className = "room-name";
    name.textContent = room.name;
    button.append(symbol, name);
    button.addEventListener("click", () => openRoom(room));
    list.append(button);
  });
}
async function openRoom(room) {
  if (activeRoom?.id === room.id) return;

  const loadToken = ++roomLoadToken;
  activeRoom = room;
  renderRoomList();
  $("roomTitle").textContent = room.name;
  $("roomDescription").textContent = room.description || "PI220 member discussion channel";
  $("messageInput").disabled = false;
  $("sendButton").disabled = false;
  $("messageInput").value = "";
  updateCharacterCount();
  resizeComposer();
  setFeedback("Keep it constructive. Duplicate messages are restricted.");
  setLiveStatus("CONNECTING TO CHANNEL");
  resetMessageStage("Retrieving recent messages…");

  const previousChannel = channel;
  channel = null;

  try {
    if (previousChannel) {
      await db.removeChannel(previousChannel);
    }
    if (loadToken !== roomLoadToken) return;

    // Buffer incoming events until the initial history has been loaded.
    const pendingMessages = new Map();
    let historyLoaded = false;
    let realtimeConnected = false;
    let reconnectNeedsCatchup = false;
    let initialSubscriptionResult = null;
    let catchupRunning = false;
    let resolveSubscription;
    let subscriptionSettled = false;

    const subscriptionReady = new Promise(resolve => {
      resolveSubscription = resolve;
    });

    const subscriptionTimeout = setTimeout(() => {
      if (!subscriptionSettled) {
        subscriptionSettled = true;
        resolveSubscription(false);
      }
    }, 8000);

    const syncMissedMessages = async () => {
      if (catchupRunning || loadToken !== roomLoadToken) return;
      catchupRunning = true;

      try {
        const { data, error } = await db.from("chat_messages")
          .select("id,room_id,sender_id,body,created_at,edited_at")
          .eq("room_id", room.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (loadToken !== roomLoadToken || activeRoom?.id !== room.id) return;

        const missedRows = (data || []).reverse();
        for (const row of missedRows) {
          await appendMessage(row);
        }
      } catch (err) {
        // A failed catch-up must not interrupt an otherwise working chat.
        if (loadToken === roomLoadToken) {
          console.warn("PI220 Realtime catch-up could not complete:", err);
        }
      } finally {
        catchupRunning = false;
      }
    };

    const nextChannel = db.channel("pi220-room-" + room.id)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: "room_id=eq." + room.id
      }, payload => {
        if (!payload.new || activeRoom?.id !== room.id ||
            loadToken !== roomLoadToken) return;

        if (!historyLoaded) {
          pendingMessages.set(payload.new.id, payload.new);
        } else {
          appendMessage(payload.new);
        }
      })
      .subscribe(state => {
        if (state === "SUBSCRIBED") {
          realtimeConnected = true;

          if (!subscriptionSettled) {
            subscriptionSettled = true;
            resolveSubscription(true);
          } else if (historyLoaded &&
                     (initialSubscriptionResult === false || reconnectNeedsCatchup)) {
            // Recover messages missed during an initial delay or reconnection.
            reconnectNeedsCatchup = false;
            syncMissedMessages();
          }
        } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(state)) {
          if (realtimeConnected) reconnectNeedsCatchup = true;
          if (!subscriptionSettled) {
            subscriptionSettled = true;
            resolveSubscription(false);
          }
        }

        if (activeRoom?.id !== room.id || loadToken !== roomLoadToken) return;
        setLiveStatus(
          state === "SUBSCRIBED" ? "LIVE" : state.replaceAll("_", " "),
          state === "SUBSCRIBED"
        );
      });

    channel = nextChannel;

    // Wait for server confirmation before querying history. Events received
    // after confirmation are buffered above while history is retrieved.
    initialSubscriptionResult = await subscriptionReady;
    clearTimeout(subscriptionTimeout);

    if (loadToken !== roomLoadToken) return;
    if (!initialSubscriptionResult && !realtimeConnected) {
      setLiveStatus("LIVE CONNECTION DELAYED");
    }

    const { data, error } = await db.from("chat_messages")
      .select("id,room_id,sender_id,body,created_at,edited_at")
      .eq("room_id", room.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (loadToken !== roomLoadToken) return;

    // The database query returns newest-first; reverse for chat chronology.
    const rowsById = new Map();
    (data || []).reverse().forEach(row => rowsById.set(row.id, row));
    pendingMessages.forEach((row, id) => rowsById.set(id, row));

    const rows = [...rowsById.values()].sort((a, b) => {
      const timeDifference = new Date(a.created_at) - new Date(b.created_at);
      return timeDifference || String(a.id).localeCompare(String(b.id));
    });

    const senderIds = [...new Set(rows.map(row => row.sender_id).filter(Boolean))];
    if (senderIds.length) {
      const { data: profiles, error: profileError } = await db.from("profiles")
        .select("id,display_name").in("id", senderIds);

      if (loadToken !== roomLoadToken) return;

      if (!profileError) {
        (profiles || []).forEach(profile => {
          profileNames[profile.id] = profile.display_name || "PI220 Member";
        });
      }
    }

    if (loadToken !== roomLoadToken) return;

    const area = $("messages");
    area.replaceChildren();

    if (!rows.length) {
      resetMessageStage("No messages yet. Start the conversation.");
    } else {
      rows.forEach(row => area.append(makeMessageNode(row)));
      scrollToLatest();
    }

    historyLoaded = true;

    // If Realtime connected only after the initial wait, perform a catch-up
    // query so messages sent during the connection gap are not left out.
    if (initialSubscriptionResult === false && realtimeConnected) {
      syncMissedMessages();
    }
  } catch (err) {
    if (loadToken !== roomLoadToken) return;

    // Do not leave a live subscription attached to a channel whose history
    // failed to load.
    if (channel) {
      const failedChannel = channel;
      channel = null;
      try {
        await db.removeChannel(failedChannel);
      } catch (_) {
        // Preserve the original channel-loading error for the user.
      }
    }

    resetMessageStage("Could not load this channel. " + (err.message || ""));
    setLiveStatus("CHANNEL ERROR");
  }
}
async function enter(user) {
  showChat(user);
  try {
    const { data, error } = await db.from("profiles")
      .select("display_name").eq("id", user.id).maybeSingle();
    if (error) throw error;
    $("memberName").textContent = (data?.display_name || user.email || "MEMBER").toUpperCase();
    await loadRooms();
    setLiveStatus("SELECT A CHANNEL");
  } catch (err) {
    $("roomList").textContent = "Directory error: " + err.message;
  }
}

$("authForm").addEventListener("submit", async event => {
  event.preventDefault();
  say(messageBox, "");
  $("submitButton").disabled = true;
  try {
    const email = $("email").value.trim();
    const password = $("password").value;
    if (mode === "register") {
      const displayName = $("displayName").value.trim();
      if (!displayName) throw new Error("Please enter a display name.");
      const { data, error } = await db.auth.signUp({
        email, password, options: { data: { display_name: displayName } }
      });
      if (error) throw error;
      say(messageBox, data.session
        ? "Account created."
        : "Registration received. Check your email if confirmation is required.");
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (err) {
    say(messageBox, err.message, true);
  } finally {
    $("submitButton").disabled = false;
  }
});
$("loginTab").addEventListener("click", () => setMode("login"));
$("registerTab").addEventListener("click", () => setMode("register"));
$("resetButton").addEventListener("click", async () => {
  const email = $("email").value.trim();
  if (!email) return say(messageBox, "Enter your email address first.", true);
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: location.origin + location.pathname
  });
  say(messageBox, error ? error.message : "If the account exists, a recovery email will be sent.", !!error);
});
$("signOutButton").addEventListener("click", async () => {
  const { error } = await db.auth.signOut();
  if (error) setFeedback("Sign-out failed: " + error.message, "error");
});
$("roomSearch").addEventListener("input", renderRoomList);
$("newMessagesButton").addEventListener("click", scrollToLatest);
$("messages").addEventListener("scroll", () => {
  if (nearBottom($("messages"))) {
    unreadMessages = 0;
    updateUnreadButton();
  }
});
$("messageInput").addEventListener("input", () => {
  updateCharacterCount();
  resizeComposer();
});
$("messageInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    $("composer").requestSubmit();
  }
});
$("composer").addEventListener("submit", async event => {
  event.preventDefault();
  if (!activeRoom || sending || !currentUser) return;
  const body = $("messageInput").value.trim();
  if (!body) return;

  sending = true;
  $("sendButton").disabled = true;
  $("sendButton").innerHTML = "SENDING <span>…</span>";
  setFeedback("Submitting securely…");

  try {
    const { error } = await db.from("chat_messages").insert({
      room_id: activeRoom.id,
      sender_id: currentUser.id,
      body
    });
    if (error) throw error;

    $("messageInput").value = "";
    updateCharacterCount();
    resizeComposer();
    setFeedback("Message submitted.", "success");
    $("messageInput").focus();
  } catch (err) {
    setFeedback(friendlySendError(err), "error");
    setLiveStatus("MESSAGE NOT SENT");
    // Keep the original text available for editing and retry.
    $("messageInput").focus();
  } finally {
    sending = false;
    $("sendButton").disabled = !activeRoom;
    $("sendButton").innerHTML = 'SEND MESSAGE <span>→</span>';
  }
});

async function init() {
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY ||
      cfg.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")) {
    status("CONFIGURATION REQUIRED");
    say(messageBox, "Add your existing Supabase publishable key in js/config.js. Never use a secret or service_role key.", true);
    return;
  }

  try {
    db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    status("CLIENT INITIALIZED", true);
    if (data.session?.user) await enter(data.session.user);

    db.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        currentUser = session.user;
        // Supabase recommends keeping this callback synchronous; load UI after the event.
        setTimeout(() => enter(session.user), 0);
      } else {
        currentUser = null;
        roomLoadToken += 1;
        activeRoom = null;
        if (channel) db.removeChannel(channel);
        channel = null;
        roomRows = [];
        profileNames = Object.create(null);
        showAuth();
        status("SIGNED OUT");
      }
    });
  } catch (err) {
    status("INITIALIZATION ERROR");
    say(messageBox, err.message, true);
  }
}

setMode("login");
updateCharacterCount();
init();
})();