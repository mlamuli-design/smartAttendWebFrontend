"use client";

import React, { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaQrcode, 
  FaTrash, 
  FaTimes,
  FaSave,
  FaChalkboardTeacher,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaUserCheck,
  FaSpinner,
  FaSearch,
  FaUserGraduate,
  FaBook,
  FaLayerGroup
} from "react-icons/fa";
import QRCode from "qrcode";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";

export default function SessionManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [uuid, setUuid] = useState(null);
  const [qrCodeWindow, setQrCodeWindow] = useState(null);
  
  // QR Session Form
  const [qrForm, setQrForm] = useState({
    venue: "",
    start_time: "",
    end_time: "",
    topic: "",
    session_type: "Lecture"
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch lecturer's modules
  const fetchModules = async (lecturerUuid) => {
    if (!lecturerUuid) {
      console.error("No UUID available");
      return;
    }
    
    try {
      const response = await fetch(`${IP}/lecturer-modules/${lecturerUuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
 
      const data = await response.json();
      if (response.ok) {
        setModules(data.modules || []);
      } else {
        showToast(data.message || "Failed to load modules", "error");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      showToast("Failed to load modules", "error");
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${IP}/sessions/`);
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      showToast("Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load user data from localStorage on client side only
  useEffect(() => {
    const storedUuid = localStorage.getItem("uuid");
    setUuid(storedUuid);
    
    if (storedUuid) {
      fetchModules(storedUuid);
    }
    fetchSessions();
    
    // Cleanup: close QR window if component unmounts
    return () => {
      if (qrCodeWindow && !qrCodeWindow.closed) {
        qrCodeWindow.close();
      }
    };
  }, []);

  // Generate QR Code for session
  const handleGenerateQR = async (module) => {
    setSelectedModule(module);
    setQrForm({
      venue: "",
      start_time: "",
      end_time: "",
      topic: "",
      session_type: "Lecture"
    });
    setShowQRModal(true);
  };

  // Confirm QR generation and create session
  const confirmGenerateQR = async () => {
    if (!qrForm.venue || !qrForm.start_time || !qrForm.end_time) {
      showToast("Please fill venue, start time and end time", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Create session in database
      const response = await fetch(`${IP}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: selectedModule.module_id,
          venue: qrForm.venue,
          start_time: qrForm.start_time,
          end_time: qrForm.end_time,
          topic: qrForm.topic,
          session_type: qrForm.session_type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to create session", "error");
        setSubmitting(false);
        return;
      }

      // Generate QR code for the session
      const sessionData = {
        session_id: data.session_id,
        module_id: selectedModule.module_id,
        module_code: selectedModule.module_code,
        module_name: selectedModule.module_name,
        venue: qrForm.venue,
        date: new Date().toISOString().split('T')[0],
        start_time: qrForm.start_time,
        end_time: qrForm.end_time,
        expiry: data.qr_code_expiry || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(sessionData), {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });

      // Close existing QR window if open
      if (qrCodeWindow && !qrCodeWindow.closed) {
        qrCodeWindow.close();
      }

      // Open new tab with QR code
      const newWindow = window.open();
      setQrCodeWindow(newWindow);
      
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${selectedModule.module_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              min-height: 100vh;
              background: linear-gradient(135deg, #003366 0%, #c8102e 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
            }
            .qr-container {
              background: white;
              padding: 50px;
              border-radius: 32px;
              text-align: center;
              box-shadow: 0 30px 80px rgba(0,0,0,0.4);
              max-width: 650px;
              width: 100%;
            }
            .qr-code { margin: 30px 0; padding: 20px; background: white; display: flex; justify-content: center; }
            .qr-img { width: 400px; height: 400px; display: block; }
            .module-name { font-size: 28px; font-weight: bold; color: #003366; margin-bottom: 8px; }
            .module-code { font-size: 18px; color: #c8102e; margin-bottom: 20px; font-weight: 600; }
            .session-details { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 16px; margin-top: 20px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
            .detail-label { font-weight: 700; color: #555; }
            .detail-value { color: #333; font-weight: 500; }
            .expiry { margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee; font-size: 13px; color: #c8102e; font-weight: 600; }
            .instruction { margin-top: 20px; font-size: 15px; color: #666; background: #f0f7ff; padding: 12px; border-radius: 12px; }
            .close-btn {
              margin-top: 20px;
              padding: 10px 20px;
              background: #c8102e;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            }
            .close-btn:hover { background: #a00d26; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="module-name">${selectedModule.module_name}</div>
            <div class="module-code">${selectedModule.module_code}</div>
            <div class="qr-code">
              <img src="${qrCodeDataURL}" class="qr-img" alt="QR Code" />
            </div>
            <div class="session-details">
              <div class="detail-row">
                <span class="detail-label">📍 Venue:</span>
                <span class="detail-value">${qrForm.venue}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏰ Time:</span>
                <span class="detail-value">${qrForm.start_time} - ${qrForm.end_time}</span>
              </div>
              ${qrForm.topic ? `<div class="detail-row">
                <span class="detail-label">📖 Topic:</span>
                <span class="detail-value">${qrForm.topic}</span>
              </div>` : ''}
            </div>
            <div class="expiry">
              ⏰ QR Code expires at ${new Date(data.qr_code_expiry || Date.now() + 3 * 60 * 60 * 1000).toLocaleTimeString()}
            </div>
            <div class="instruction">
              📱 Students: Scan this QR code with your phone camera to mark your attendance
            </div>
            <button class="close-btn" onclick="window.close()">Close Window</button>
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();

      showToast("Session created and QR code generated!", "success");
      fetchSessions();
      setShowQRModal(false);
    } catch (error) {
      console.error("Error generating QR:", error);
      showToast("Failed to generate QR code", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Manual attendance marking
  const handleMarkAttendance = async (session) => {
    setSelectedSession(session);
    setStudentSearch("");
    
    try {
      // Fetch enrolled students for this module with attendance status
      const response = await fetch(`${IP}/module-enrollments-with-attendance/${session.module_id}/${session.session_id}`);
      const data = await response.json();
      if (response.ok) {
        setAttendanceList(data.enrollments || []);
      } else {
        setAttendanceList([]);
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      showToast("Failed to load students", "error");
      setAttendanceList([]);
    }
    
    setShowAttendanceModal(true);
  };

  // Search and mark student as present
  const markStudentPresent = async () => {
    if (!studentSearch.trim()) {
      showToast("Please enter Student ID", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${IP}/mark-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession.session_id,
          student_id_number: studentSearch.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to mark attendance", "error");
        setSubmitting(false);
        return;
      }

      showToast(`Attendance marked for ${data.student_name}`, "success");
      setStudentSearch("");
      
      // Refresh attendance list
      const refreshResponse = await fetch(`${IP}/module-enrollments-with-attendance/${selectedSession.module_id}/${selectedSession.session_id}`);
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setAttendanceList(refreshData.enrollments || []);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelSession = async (sessionId) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`${IP}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.message || "Failed to cancel session", "error");
        setSubmitting(false);
        return;
      }

      showToast("Session cancelled", "info");
      fetchSessions();
    } catch (error) {
      console.error("Error cancelling session:", error);
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (session) => {
    const now = new Date();
    const expiryDate = new Date(session.qr_code_expiry);
    
    if (session.is_active === false) return { color: "#c8102e", bg: "rgba(200, 16, 46, 0.15)", text: "Cancelled" };
    if (expiryDate > now) return { color: "#2ecc71", bg: "rgba(46, 204, 113, 0.15)", text: "Active" };
    return { color: "#4a9eff", bg: "rgba(74, 158, 255, 0.15)", text: "Expired" };
  };

  return (
    <div className={styles.container}>
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`${styles.mainContent} ${collapsed ? styles.mainCollapsed : styles.mainExpanded}`}>
        {/* Toast Notification */}
        {toast.show && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === "success" && <FaCheckCircle />}
            {toast.type === "error" && <FaExclamationCircle />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <FaCalendarAlt className={styles.titleIcon} />
              Session Management
            </h1>
            <p className={styles.subtitle}>Create attendance sessions with QR code tracking for your modules</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaBook />
            </div>
            <div className={styles.statInfo}>
              <h3>{modules.length}</h3>
              <p>My Modules</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaQrcode />
            </div>
            <div className={styles.statInfo}>
              <h3>{sessions.filter(s => s.is_active && new Date(s.qr_code_expiry) > new Date()).length}</h3>
              <p>Active QR Sessions</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>{sessions.length}</h3>
              <p>Total Sessions</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaUsers />
            </div>
            <div className={styles.statInfo}>
              <h3>{sessions.reduce((sum, s) => sum + (s.attendance_count || 0), 0)}</h3>
              <p>Total Attendance</p>
            </div>
          </div>
        </div>

        {/* My Modules Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaChalkboardTeacher className={styles.sectionIcon} />
            My Modules
          </h2>
          <p className={styles.sectionSubtitle}>Select a module to generate a QR code session</p>
        </div>

        <div className={styles.modulesGrid}>
          {modules.length > 0 ? (
            modules.map((module) => (
              <div key={module.module_id} className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                  <div className={styles.moduleCode}>{module.module_code}</div>
                  <div className={styles.moduleStudents}>
                    <FaUsers /> {module.enrolled_count || 0} students
                  </div>
                </div>
                <h3 className={styles.moduleName}>{module.module_name}</h3>
                <div className={styles.moduleDetails}>
                  <div className={styles.detailItem}>
                    <FaBook className={styles.detailIcon} />
                    <span>{module.course_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FaLayerGroup className={styles.detailIcon} />
                    <span>{module.credits} Credits</span>
                  </div>
                </div>
                <div className={styles.moduleActions}>
                  <button className={styles.qrBtn} onClick={() => handleGenerateQR(module)} disabled={submitting}>
                    <FaQrcode /> Generate QR Code
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FaBook className={styles.emptyIcon} />
              <h3>No modules assigned</h3>
              <p>You haven't been assigned any modules yet</p>
            </div>
          )}
        </div>

        {/* Recent Sessions Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaCalendarAlt className={styles.sectionIcon} />
            Recent Sessions
          </h2>
        </div>

        <div className={styles.sessionsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <FaSpinner className={styles.spinner} />
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => {
              const statusStyle = getStatusBadge(session);
              return (
                <div key={session.session_id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div>
                      <div className={styles.sessionModuleName}>{session.module_name}</div>
                      <div className={styles.sessionModuleCode}>{session.module_code}</div>
                    </div>
                    <div className={styles.sessionStatus} style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.text}
                    </div>
                  </div>
                  <div className={styles.sessionDetails}>
                    <div className={styles.sessionDetailItem}>
                      <FaCalendarAlt className={styles.detailIcon} />
                      <span>{new Date(session.session_date).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.sessionDetailItem}>
                      <FaClock className={styles.detailIcon} />
                      <span>{session.start_time} - {session.end_time}</span>
                    </div>
                    <div className={styles.sessionDetailItem}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <span>{session.location}</span>
                    </div>
                    {session.topic && (
                      <div className={styles.sessionDetailItem}>
                        <FaBook className={styles.detailIcon} />
                        <span>{session.topic}</span>
                      </div>
                    )}
                    <div className={styles.sessionDetailItem}>
                      <FaUsers className={styles.detailIcon} />
                      <span>Attendance: {session.attendance_count || 0} students</span>
                    </div>
                  </div>
                  <div className={styles.sessionActions}>
                    {statusStyle.text === "Active" && (
                      <>
                        <button className={styles.attendanceBtn} onClick={() => handleMarkAttendance(session)}>
                          <FaUserCheck /> Mark Attendance
                        </button>
                        <button className={styles.cancelSessionBtn} onClick={() => cancelSession(session.session_id)} disabled={submitting}>
                          <FaTrash /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <FaCalendarAlt className={styles.emptyIcon} />
              <h3>No sessions yet</h3>
              <p>Generate a QR code from any module above to create your first session</p>
            </div>
          )}
        </div>
      </main>

      {/* QR Session Modal */}
      {showQRModal && selectedModule && (
        <div className={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create QR Session</h2>
              <button className={styles.modalClose} onClick={() => setShowQRModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.moduleInfo}>
                <h3>{selectedModule.module_name}</h3>
                <p>{selectedModule.module_code}</p>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaMapMarkerAlt className={styles.inputIcon} />
                  Venue / Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Science Lab A, Room 201"
                  value={qrForm.venue}
                  onChange={(e) => setQrForm({ ...qrForm, venue: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <FaClock className={styles.inputIcon} />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={qrForm.start_time}
                    onChange={(e) => setQrForm({ ...qrForm, start_time: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <FaClock className={styles.inputIcon} />
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={qrForm.end_time}
                    onChange={(e) => setQrForm({ ...qrForm, end_time: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaBook className={styles.inputIcon} />
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Data Structures"
                  value={qrForm.topic}
                  onChange={(e) => setQrForm({ ...qrForm, topic: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <FaCalendarAlt className={styles.inputIcon} />
                  Session Type
                </label>
                <select
                  value={qrForm.session_type}
                  onChange={(e) => setQrForm({ ...qrForm, session_type: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="Lecture">📖 Lecture</option>
                  <option value="Lab">🔬 Lab</option>
                  <option value="Tutorial">📝 Tutorial</option>
                  <option value="Exam">📋 Exam</option>
                </select>
              </div>
              
              <div className={styles.infoNote}>
                <FaClock className={styles.infoIcon} />
                QR code will expire 3 hours after generation
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowQRModal(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={confirmGenerateQR} disabled={submitting}>
                <FaQrcode /> {submitting ? "Generating..." : "Generate QR & Start Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <div className={styles.modalOverlay} onClick={() => setShowAttendanceModal(false)}>
          <div className={styles.attendanceModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Mark Attendance</h2>
              <button className={styles.modalClose} onClick={() => setShowAttendanceModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.sessionInfo}>
                <h3>{selectedSession.module_name}</h3>
                <p>{selectedSession.location} | {selectedSession.start_time} - {selectedSession.end_time}</p>
              </div>
              
              <div className={styles.manualAttendanceSearch}>
                <div className={styles.searchBar}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Enter Student ID Number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className={styles.searchInput}
                    onKeyPress={(e) => e.key === 'Enter' && markStudentPresent()}
                  />
                  <button className={styles.markPresentBtn} onClick={markStudentPresent} disabled={submitting}>
                    <FaUserCheck /> Mark Present
                  </button>
                </div>
              </div>
              
              <div className={styles.attendanceList}>
                <div className={styles.attendanceHeader}>
                  <span>Student ID</span>
                  <span>Student Name</span>
                  <span>Status</span>
                </div>
                {attendanceList.length > 0 ? (
                  attendanceList.map((student) => (
                    <div key={student.student_id} className={styles.attendanceRow}>
                      <span>{student.student_id_number}</span>
                      <span>{student.student_name}</span>
                      <span className={student.is_present ? styles.presentBadge : styles.absentBadge}>
                        {student.is_present ? "✓ Present" : "○ Not Marked"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyStudents}>
                    <FaUsers className={styles.emptyIcon} />
                    <p>No students enrolled in this module</p>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowAttendanceModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}