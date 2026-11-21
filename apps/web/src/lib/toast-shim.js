function showFloatingNotification(message, type = "success") {
  try {
    const el = document.createElement("div");
    el.className = `fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all transform duration-300 ${type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 3000);
  } catch (e) {
  }
}

export const toast = {
  success: (msg) => {
    try {
      if (window.toast?.success) return window.toast.success(msg);
    } catch (e) {}
    showFloatingNotification(msg, "success");
  },
  error: (msg) => {
    try {
      if (window.toast?.error) return window.toast.error(msg);
    } catch (e) {}
    showFloatingNotification(msg, "error");
  },
  info: (msg) => {
    try {
      if (window.toast?.info) return window.toast.info(msg);
    } catch (e) {}
    showFloatingNotification(msg, "info");
  }
};

export default toast;
