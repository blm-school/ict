const defaultConfig = {
            calendar_title: "ปฏิทินงาน ICT",
            department_name: "ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร",
        };

        let currentDate = new Date();
        let eventsData = [];
        const API_URL =
            "https://script.google.com/macros/s/AKfycbzdvK9oM_oPyg8_wCN8OwCPGSSKFfKpGoja3yl-4_ryuyjI1SAZEFVK_7O8izttSjuQ/exec";

        const thaiMonths = [
            "มกราคม",
            "กุมภาพันธ์",
            "มีนาคม",
            "เมษายน",
            "พฤษภาคม",
            "มิถุนายน",
            "กรกฎาคม",
            "สิงหาคม",
            "กันยายน",
            "ตุลาคม",
            "พฤศจิกายน",
            "ธันวาคม",
        ];

        const thaiDays = [
            "อาทิตย์",
            "จันทร์",
            "อังคาร",
            "พุธ",
            "พฤหัสบดี",
            "ศุกร์",
            "เสาร์",
        ];

        async function fetchEvents() {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (data.success) {
                    // กรองเฉพาะกิจกรรมที่มีสถานะ "รับทราบ" เท่านั้น
                    eventsData = data.data.filter(
                        (event) => event.status && event.status.trim() === "รับทราบ"
                    );
                    renderCalendar();
                } else {
                    showError("ไม่สามารถโหลดข้อมูลได้: " + data.error);
                }
            } catch (error) {
                showError("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error.message);
            }
        }

        function showError(message) {
            document.getElementById(
                "calendar-container"
            ).innerHTML = `<div class="error">${message}</div>`;
        }

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            document.getElementById("current-month").textContent = `${thaiMonths[month]
                } ${year + 543}`;

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            let calendarHTML = '<div class="calendar-grid">';

            // Headers
            thaiDays.forEach((day) => {
                calendarHTML += `<div class="day-header">${day}</div>`;
            });

            // Calendar days
            const today = new Date();
            for (let i = 0; i < 42; i++) {
                const currentDay = new Date(startDate);
                currentDay.setDate(startDate.getDate() + i);

                const isCurrentMonth = currentDay.getMonth() === month;
                const isToday = currentDay.toDateString() === today.toDateString();

                const dayEvents = getEventsForDate(currentDay);
                const hasEvents = dayEvents.length > 0;

                let cellClass = "day-cell";
                if (!isCurrentMonth) cellClass += " other-month";
                if (isToday) cellClass += " today";
                if (hasEvents) cellClass += " has-events";

                const dateStr = formatDateToThaiTimezone(currentDay);

                calendarHTML += `<div class="${cellClass}" onclick="showDayModal('${dateStr}')">`;
                calendarHTML += `<div class="day-number">${currentDay.getDate()}</div>`;

                if (hasEvents) {
                    calendarHTML += `<div class="event-count">${dayEvents.length}</div>`;

                    // Show max 2 event previews
                    const previewEvents = dayEvents.slice(0, 2);
                    previewEvents.forEach((event) => {
                        calendarHTML += `<div class="event-preview">${event.title}</div>`;
                    });

                    if (dayEvents.length > 2) {
                        calendarHTML += `<div class="event-preview">+${dayEvents.length - 2
                            } งานอื่นๆ</div>`;
                    }
                }

                calendarHTML += "</div>";
            }

            calendarHTML += "</div>";
            document.getElementById("calendar-container").innerHTML = calendarHTML;
        }

        function getEventsForDate(date) {
            const dateStr = formatDateToThaiTimezone(date);
            return eventsData
                .filter((event) => {
                    if (!event.eventDate) return false;
                    const eventDate = new Date(event.eventDate);
                    return formatDateToThaiTimezone(eventDate) === dateStr;
                })
                .map((event) => ({
                    id: event.id,
                    title: event.eventName || "ไม่ระบุชื่องาน",
                }));
        }

        function formatDateToThaiTimezone(date) {
            // Convert to Thai timezone (UTC+7)
            const thaiDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
            return thaiDate.toISOString().split("T")[0];
        }

        function showDayModal(dateStr) {
            const selectedDate = new Date(dateStr + "T00:00:00");
            const dayEvents = eventsData.filter((event) => {
                if (!event.eventDate) return false;
                const eventDate = new Date(event.eventDate);
                return formatDateToThaiTimezone(eventDate) === dateStr;
            });

            const thaiDate = selectedDate.toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            document.getElementById("day-modal-title").textContent = thaiDate;

            let modalBody = "";

            if (dayEvents.length === 0) {
                modalBody = `
                    <div class="no-events">
                        <div class="no-events-icon">📅</div>
                        <h3>ไม่มีงานในวันนี้</h3>
                        <p>วันนี้ไม่มีกิจกรรมหรืองานที่ต้องดำเนินการ</p>
                    </div>
                `;
            } else {
                dayEvents.forEach((event) => {
                    modalBody += `
                        <div class="event-card" onclick="showEventModal('${event.id
                        }')">
                            <div class="event-card-title">${event.eventName || "ไม่ระบุชื่องาน"
                        }</div>
                            ${event.timeSlot
                            ? `<div class="event-card-time">⏰ ${event.timeSlot}</div>`
                            : ""
                        }
                            ${event.reporterName
                            ? `<div class="event-card-reporter">👤 ${event.reporterName}</div>`
                            : ""
                        }
                        </div>
                    `;
                });
            }

            document.getElementById("day-modal-body").innerHTML = modalBody;
            document.getElementById("day-modal").style.display = "block";
        }

        function hideDayModal() {
            document.getElementById("day-modal").style.display = "none";
        }

        function showEventModal(eventId) {
            const event = eventsData.find((e) => e.id === eventId);
            if (!event) return;

            document.getElementById("modal-title").textContent =
                event.eventName || "ไม่ระบุชื่องาน";

            let modalBody = "";

            if (event.reporterName) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">ผู้แจ้ง</span>
                        <div class="modal-value">${event.reporterName}</div>
                    </div>
                `;
            }

            if (event.contactNumber) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">เบอร์ติดต่อ</span>
                        <div class="modal-value">${event.contactNumber}</div>
                    </div>
                `;
            }

            if (event.eventDate) {
                const eventDate = new Date(event.eventDate);
                // Convert to Thai timezone for display
                const thaiEventDate = new Date(
                    eventDate.getTime() + 7 * 60 * 60 * 1000
                );
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">วันที่จัดงาน</span>
                        <div class="modal-value">${thaiEventDate.toLocaleDateString(
                    "th-TH"
                )}</div>
                    </div>
                `;
            }

            if (event.timeSlot) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">ช่วงเวลา</span>
                        <div class="modal-value">${event.timeSlot}</div>
                    </div>
                `;
            }

            if (event.coordinationArea) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">ประสานงานในด้าน</span>
                        <div class="modal-value">${event.coordinationArea}</div>
                    </div>
                `;
            }

            if (event.additionalDetails) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">รายละเอียดเพิ่มเติม</span>
                        <div class="modal-value">${event.additionalDetails}</div>
                    </div>
                `;
            }

            if (event.fileName && event.fileUrl) {
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">ไฟล์แนบ</span>
                        <div class="modal-value">
                            <a href="${event.fileUrl}" target="_blank" rel="noopener noreferrer" class="file-link">
                                📎 ${event.fileName}
                            </a>
                        </div>
                    </div>
                `;
            }

            modalBody += `
                <div class="modal-detail">
                    <span class="modal-label">สถานะ</span>
                    <div class="modal-value">
                        <span class="status-badge status-approved">${event.status}</span>
                    </div>
                </div>
            `;

            if (event.recordDate) {
                const recordDate = new Date(event.recordDate);
                // Convert to Thai timezone for display
                const thaiRecordDate = new Date(
                    recordDate.getTime() + 7 * 60 * 60 * 1000
                );
                modalBody += `
                    <div class="modal-detail">
                        <span class="modal-label">วันที่บันทึก</span>
                        <div class="modal-value">${thaiRecordDate.toLocaleDateString(
                    "th-TH"
                )}</div>
                    </div>
                `;
            }

            document.getElementById("modal-body").innerHTML = modalBody;
            document.getElementById("event-modal").style.display = "block";
        }

        function hideEventModal() {
            document.getElementById("event-modal").style.display = "none";
        }

        async function onConfigChange(config) {
            const calendarTitle =
                config.calendar_title || defaultConfig.calendar_title;
            const departmentName =
                config.department_name || defaultConfig.department_name;

            document.getElementById("calendar-title").textContent = calendarTitle;
            document.getElementById("department-name").textContent = departmentName;
        }

        function mapToCapabilities(config) {
            return {
                recolorables: [],
                borderables: [],
                fontEditable: undefined,
                fontSizeable: undefined,
            };
        }

        function mapToEditPanelValues(config) {
            return new Map([
                [
                    "calendar_title",
                    config.calendar_title || defaultConfig.calendar_title,
                ],
                [
                    "department_name",
                    config.department_name || defaultConfig.department_name,
                ],
            ]);
        }

        // Event listeners
        document.getElementById("prev-month").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById("next-month").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        document
            .getElementById("close-day-modal")
            .addEventListener("click", hideDayModal);
        document.getElementById("day-modal").addEventListener("click", (e) => {
            if (e.target === document.getElementById("day-modal")) {
                hideDayModal();
            }
        });

        document
            .getElementById("close-modal")
            .addEventListener("click", hideEventModal);
        document.getElementById("event-modal").addEventListener("click", (e) => {
            if (e.target === document.getElementById("event-modal")) {
                hideEventModal();
            }
        });

        // Initialize
        if (window.elementSdk) {
            window.elementSdk.init({
                defaultConfig,
                onConfigChange,
                mapToCapabilities,
                mapToEditPanelValues,
            });
        }

        // Load events on page load
        fetchEvents();
    
        (function () {
            function c() {
                var b = a.contentDocument || a.contentWindow.document;
                if (b) {
                    var d = b.createElement("script");
                    d.innerHTML =
                        "window.__CF$cv$params={r:'99fe330906f2732e',t:'MTc2MzM3MTcyMS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
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
                    var e = document.onreadystatechange || function () { };
                    document.onreadystatechange = function (b) {
                        e(b);
                        "loading" !== document.readyState &&
                            ((document.onreadystatechange = e), c());
                    };
                }
            }
        })();