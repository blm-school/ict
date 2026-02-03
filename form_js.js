// Show/hide other work details
document.getElementById("otherCheck").addEventListener("change", function () {
  const otherDetails = document.getElementById("otherDetails");
  if (this.checked) {
    otherDetails.classList.remove("hidden");
  } else {
    otherDetails.classList.add("hidden");
    document.querySelector('input[name="otherWork"]').value = "";
  }
});

// Form submission
document
  .getElementById("ictForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const submitText = document.querySelector(".submit-text");
    const loading = document.querySelector(".loading");
    const successMsg = document.querySelector(".success");
    const errorMsg = document.querySelector(".error");

    submitText.style.display = "none";
    loading.style.display = "inline";
    submitBtn.disabled = true;
    successMsg.style.display = "none";
    errorMsg.style.display = "none";

    try {
      const formData = new FormData(this);

      // Get coordination values
      const coordinationChecked = [];
      document
        .querySelectorAll('input[name="coordination"]:checked')
        .forEach((checkbox) => {
          if (checkbox.value === "งานอื่นๆ") {
            const otherWork = document.querySelector(
              'input[name="otherWork"]',
            ).value;
            if (otherWork) {
              coordinationChecked.push(`งานอื่นๆ: ${otherWork}`);
            }
          } else {
            coordinationChecked.push(checkbox.value);
          }
        });

      // Prepare data for Google Sheets
      const data = {
        fullName: formData.get("fullName"),
        phoneNumber: formData.get("phoneNumber"),
        eventName: formData.get("eventName"),
        eventDate: formData.get("eventDate"),
        eventTime: formData.get("eventTime"),
        coordination: coordinationChecked.join(", "),
        additionalDetails: formData.get("additionalDetails") || "-",
        timestamp: new Date().toLocaleString("th-TH"),
        sheetName: "data",
      };

      // Handle file upload if exists
      const fileInput = document.querySelector('input[name="attachedFile"]');
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
          data.fileName = file.name;
          data.fileData = e.target.result.split(",")[1]; // Remove data:mime;base64, prefix
          data.folderId = "1RlVX2_e9WB96BTmXglozkCqJws99XyeW";

          await submitData(data);
        };

        reader.readAsDataURL(file);
      } else {
        await submitData(data);
      }
    } catch (error) {
      console.error("Error:", error);
      showError();
    }
  });

async function submitData(data) {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxxfpM6wNbCisoOtPWSaPsPzHJDa5GH2V51SZANem_1ZJ8eGEeZjMsRHIiioeWp0_96hQ/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    // Since we're using no-cors, we can't check the actual response
    // We'll assume success if no error is thrown
    showSuccess();
  } catch (error) {
    console.error("Submit error:", error);
    showError();
  }
}

function showSuccess() {
  const submitBtn = document.querySelector('button[type="submit"]');
  const submitText = document.querySelector(".submit-text");
  const loading = document.querySelector(".loading");
  const successMsg = document.querySelector(".success");

  submitText.style.display = "inline";
  loading.style.display = "none";
  submitBtn.disabled = false;
  successMsg.style.display = "block";

  // Reset form
  document.getElementById("ictForm").reset();
  document.getElementById("otherDetails").classList.add("hidden");

  // Scroll to success message
  successMsg.scrollIntoView({ behavior: "smooth" });
}

function showError() {
  const submitBtn = document.querySelector('button[type="submit"]');
  const submitText = document.querySelector(".submit-text");
  const loading = document.querySelector(".loading");
  const errorMsg = document.querySelector(".error");

  submitText.style.display = "inline";
  loading.style.display = "none";
  submitBtn.disabled = false;
  errorMsg.style.display = "block";

  // Scroll to error message
  errorMsg.scrollIntoView({ behavior: "smooth" });
}

// Validate coordination selection
document.getElementById("ictForm").addEventListener("submit", function (e) {
  const coordinationChecked = document.querySelectorAll(
    'input[name="coordination"]:checked',
  );
  if (coordinationChecked.length === 0) {
    e.preventDefault();
    alert("กรุณาเลือกประเภทงานที่ต้องการประสานงานอย่างน้อย 1 ข้อ");
    return false;
  }
});
(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'997112e6c7e674d4',t:'MTc2MTg5MTkxMy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
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
