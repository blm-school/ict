const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyWNjiyDPPIG06g5Dx_w9r5AA6qZsCCubKvFRQMWzS5wnN0aPhjgijgiZWDckziyNb7/exec";

const form = document.getElementById("reportForm");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `p-4 rounded-lg ${type === "success" ? "bg-green-100 text-green-800" : type === "error" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`;
  statusMessage.classList.remove("hidden");
}

function hideStatus() {
  statusMessage.classList.add("hidden");
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// จัดการการแสดง/ซ่อนช่องกรอกข้อมูลเมื่อเลือก "อื่นๆ"
const departmentSelect = document.getElementById("department");
const otherDepartmentDiv = document.getElementById("otherDepartmentDiv");
const otherDepartmentInput = document.getElementById("otherDepartment");

departmentSelect.addEventListener("change", function () {
  if (this.value === "อื่นๆ") {
    otherDepartmentDiv.classList.remove("hidden");
    otherDepartmentInput.required = true;
  } else {
    otherDepartmentDiv.classList.add("hidden");
    otherDepartmentInput.required = false;
    otherDepartmentInput.value = "";
  }
});

// จัดการการแสดง/ซ่อนช่องกรอกข้อมูลประเภทคำขอเมื่อเลือก "อื่นๆ"
const requestTypeSelect = document.getElementById("requestType");
const otherRequestTypeDiv = document.getElementById("otherRequestTypeDiv");
const otherRequestTypeInput = document.getElementById("otherRequestType");

requestTypeSelect.addEventListener("change", function () {
  if (this.value === "อื่นๆ") {
    otherRequestTypeDiv.classList.remove("hidden");
    otherRequestTypeInput.required = true;
  } else {
    otherRequestTypeDiv.classList.add("hidden");
    otherRequestTypeInput.required = false;
    otherRequestTypeInput.value = "";
  }
});

// จัดการการแสดง/ซ่อนช่องกรอกข้อมูลประเภทปัญหาเมื่อเลือก "อื่นๆ"
const issueTypeSelect = document.getElementById("issueType");
const otherIssueTypeDiv = document.getElementById("otherIssueTypeDiv");
const otherIssueTypeInput = document.getElementById("otherIssueType");

issueTypeSelect.addEventListener("change", function () {
  if (this.value === "อื่นๆ") {
    otherIssueTypeDiv.classList.remove("hidden");
    otherIssueTypeInput.required = true;
  } else {
    otherIssueTypeDiv.classList.add("hidden");
    otherIssueTypeInput.required = false;
    otherIssueTypeInput.value = "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังส่งข้อมูล...";
  showStatus("กำลังบันทึกข้อมูล กรุณารอสักครู่...", "info");

  try {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    // จัดการข้อมูลกลุ่มงาน
    let departmentValue = formData.get("department");
    if (departmentValue === "อื่นๆ") {
      departmentValue = formData.get("otherDepartment");
    }

    // จัดการข้อมูลประเภทคำขอ
    let requestTypeValue = formData.get("requestType");
    if (requestTypeValue === "อื่นๆ") {
      requestTypeValue = formData.get("otherRequestType");
    }

    // จัดการข้อมูลประเภทปัญหา
    let issueTypeValue = formData.get("issueType");
    if (issueTypeValue === "อื่นๆ") {
      issueTypeValue = formData.get("otherIssueType");
    }

    params.append("fullName", formData.get("fullName"));
    params.append("department", departmentValue);
    params.append("phone", formData.get("phone"));
    params.append("requestType", requestTypeValue);
    params.append("issueType", issueTypeValue);
    params.append("location", formData.get("location"));
    params.append("description", formData.get("description"));

    const fileInput = document.getElementById("fileUpload");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const base64Data = await fileToBase64(file);
      params.append("fileName", file.name);
      params.append("mimeType", file.type);
      params.append("fileData", base64Data);
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: params,
    });

    const result = await response.json();

    if (result.status === "success") {
      showStatus("✓ บันทึกข้อมูลสำเร็จ! ขอบคุณสำหรับการแจ้งเหตุ", "success");
      form.reset();
      setTimeout(() => {
        hideStatus();
      }, 5000);
    } else {
      showStatus(
        "เกิดข้อผิดพลาด: " + (result.message || "ไม่สามารถส่งข้อมูลได้"),
        "error",
      );
    }
  } catch (error) {
    showStatus("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง", "error");
    console.error("Error:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "ส่งแบบฟอร์ม";
  }
});

const defaultConfig = {
  primary_color: "#2563eb",
  background_color: "#eff6ff",
  text_color: "#1f2937",
  form_title: "แบบฟอร์มแจ้งเหตุระบบเครือข่ายอินเตอร์เน็ตขัดข้อง",
  subtitle: "งานระบบเครือข่ายอินเทอร์เน็ต โรงเรียนบางละมุง",
  font_family: "Sarabun",
  font_size: 16,
};

let config = { ...defaultConfig };

async function onConfigChange(newConfig) {
  const primaryColor = newConfig.primary_color || defaultConfig.primary_color;
  const backgroundColor =
    newConfig.background_color || defaultConfig.background_color;
  const textColor = newConfig.text_color || defaultConfig.text_color;
  const formTitle = newConfig.form_title || defaultConfig.form_title;
  const subtitle = newConfig.subtitle || defaultConfig.subtitle;
  const fontFamily = newConfig.font_family || defaultConfig.font_family;
  const fontSize = newConfig.font_size || defaultConfig.font_size;

  document.body.style.background = `linear-gradient(to bottom right, ${backgroundColor}, ${primaryColor}20)`;
  document.body.style.fontFamily = `${fontFamily}, 'Sarabun', 'Noto Sans Thai', sans-serif`;

  document.querySelector("h1").textContent = formTitle;
  document.querySelector("h1").style.color = textColor;
  document.querySelector("h1").style.fontSize = `${fontSize * 1.875}px`;

  const subtitleEl = document.querySelector("h1 + p");
  subtitleEl.textContent = subtitle;
  subtitleEl.style.color = textColor;
  subtitleEl.style.fontSize = `${fontSize}px`;

  const labels = document.querySelectorAll("label");
  labels.forEach((label) => {
    label.style.color = textColor;
    label.style.fontSize = `${fontSize * 0.875}px`;
  });

  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.style.fontSize = `${fontSize}px`;
  });

  submitBtn.style.backgroundColor = primaryColor;
  submitBtn.style.fontSize = `${fontSize}px`;
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        {
          get: () => config.primary_color || defaultConfig.primary_color,
          set: (value) => {
            config.primary_color = value;
            window.elementSdk.setConfig({ primary_color: value });
          },
        },
        {
          get: () => config.background_color || defaultConfig.background_color,
          set: (value) => {
            config.background_color = value;
            window.elementSdk.setConfig({ background_color: value });
          },
        },
        {
          get: () => config.text_color || defaultConfig.text_color,
          set: (value) => {
            config.text_color = value;
            window.elementSdk.setConfig({ text_color: value });
          },
        },
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: (value) => {
          config.font_family = value;
          window.elementSdk.setConfig({ font_family: value });
        },
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: (value) => {
          config.font_size = value;
          window.elementSdk.setConfig({ font_size: value });
        },
      },
    }),
    mapToEditPanelValues: (config) =>
      new Map([
        ["form_title", config.form_title || defaultConfig.form_title],
        ["subtitle", config.subtitle || defaultConfig.subtitle],
      ]),
  });

  config = window.elementSdk.config;
}

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'9992527eb79274f2',t:'MTc2MjI0MDU0OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
