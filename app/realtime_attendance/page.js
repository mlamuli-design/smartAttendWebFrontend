"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaChalkboardTeacher,
  FaEnvelope,
  FaIdCard,
  FaCheckCircle,
  FaExclamationCircle,
  FaUserGraduate,
  FaBook,
  FaUniversity,
  FaCalendarAlt,
  FaUserPlus,
  FaUserMinus,
  FaSpinner,
  FaQrcode,
  FaClock,
  FaMapMarkerAlt
} from "react-icons/fa";
import QRCode from "qrcode";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";

export default function StudentEnrollment() {
  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [search, setSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uuid, setUuid] = useState(null);
  
  // QR Session Form State
  const [showQRModal, setShowQRModal] = useState(false);
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

  // Get uuid from localStorage on client side only
  useEffect(() => {
    const storedUuid = localStorage.getItem("uuid");
    console.log("Retrieved uuid from localStorage:", storedUuid);
    setUuid(storedUuid);
  }, []);

  // Fetch modules (only those taught by logged-in lecturer)
  const fetchModules = async () => {
    if (!uuid) {
      console.log("No uuid found, skipping fetchModules");
      return;
    }
    
    try {
      console.log(`Fetching modules for lecturer UUID: ${uuid}`);
      const response = await fetch(`${IP}/lecturer-modules/${uuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      console.log("Modules fetched:", data);
      if (response.ok) {
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      showToast("Failed to load modules", "error");
    }
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await fetch(`${IP}/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("Failed to load students", "error");
    }
  };

  // Fetch enrollments for selected module
  const fetchEnrollments = async (moduleId) => {
    if (!moduleId) return;
    setLoading(true);
    try {
      console.log(`Fetching enrollments for module: ${moduleId}`);
      const response = await fetch(`${IP}/module-enrollments/${moduleId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      if (response.ok) {
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showToast("Failed to load enrollments", "error");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate QR Code for session
  const handleGenerateQR = async () => {
    if (!selectedModule) {
      showToast("Please select a module first", "error");
      return;
    }
    
    setShowQRModal(true);
    setQrForm({
      venue: "",
      start_time: "",
      end_time: "",
      topic: "",
      session_type: "Lecture"
    });
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
        expiry: data.qr_code_expiry
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(sessionData), {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });

      // Open new tab with QR code
      const qrWindow = window.open();
      qrWindow.document.write(`
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
              ⏰ QR Code expires at ${new Date(data.qr_code_expiry).toLocaleTimeString()}
            </div>
            <div class="instruction">
              📱 Students: Scan this QR code with your phone camera to mark your attendance
            </div>
          </div>
          <script>setTimeout(() => window.close(), 5000);</script>
        </body>
        </html>
      `);
      qrWindow.document.close();

      showToast("Session created and QR code generated!", "success");
      setShowQRModal(false);
    } catch (error) {
      console.error("Error generating QR:", error);
      showToast("Failed to generate QR code", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch data when uuid is available
  useEffect(() => {
    if (uuid) {
      fetchModules();
      fetchStudents();
    }
  }, [uuid]);

  useEffect(() => {
    if (selectedModule) {
      fetchEnrollments(selectedModule.module_id);
    }
  }, [selectedModule]);

  // Filter students not already enrolled in selected module
  useEffect(() => {
    if (selectedModule && students.length > 0 && enrollments.length >= 0) {
      const enrolledStudentIds = enrollments.map(e => e.student_id);
      const available = students.filter(s => !enrolledStudentIds.includes(s.student_id));
      setAvailableStudents(available);
    }
  }, [selectedModule, students, enrollments]);

  // Handle enroll student
  const handleEnrollStudent = async (student) => {
    if (!selectedModule) return;
    setSubmitting(true);
    
    try {
      console.log(`Enrolling student ${student.student_id} in module ${selectedModule.module_id}`);
      const response = await fetch(`${IP}/enroll-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.student_id,
          module_id: selectedModule.module_id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showToast(data.message || "Failed to enroll student", "error");
        return;
      }
      
      showToast(`${student.name} enrolled in ${selectedModule.module_name}`, "success");
      fetchEnrollments(selectedModule.module_id);
      setShowEnrollModal(false);
      setStudentSearch("");
    } catch (error) {
      console.error("Error enrolling student:", error);
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle remove student from module
  const handleRemoveStudent = async () => {
    if (!showRemoveModal) return;
    setSubmitting(true);
    
    try {
      console.log(`Removing student ${showRemoveModal.student_id} from module ${selectedModule.module_id}`);
      const response = await fetch(`${IP}/remove-enrollment`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: showRemoveModal.student_id,
          module_id: selectedModule.module_id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showToast(data.message || "Failed to remove student", "error");
        return;
      }
      
      showToast(`${showRemoveModal.student_name} removed from ${selectedModule.module_name}`, "success");
      fetchEnrollments(selectedModule.module_id);
      setShowRemoveModal(null);
    } catch (error) {
      console.error("Error removing student:", error);
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Get enrolled students for selected module
  const getModuleStudents = () => {
    return enrollments.map(e => ({
      enrollment_id: e.enrollment_id,
      student_id: e.student_id,
      student_name: e.student_name,
      student_id_number: e.student_id_number,
      email: e.email,
      enrolled_date: e.enrollment_date
    }));
  };

  const moduleStudents = getModuleStudents();
  const filteredAvailableStudents = availableStudents.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.student_id_number?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredModules = modules.filter(m =>
    m.module_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.module_code?.toLowerCase().includes(search.toLowerCase())
  );

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
              <FaUsers className={styles.titleIcon} />
              Student Enrollment
            </h1>
            <p className={styles.subtitle}>Manage student enrollments for your modules</p>
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
              <FaUserGraduate />
            </div>
            <div className={styles.statInfo}>
              <h3>{enrollments.length}</h3>
              <p>Enrolled Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaUsers />
            </div>
            <div className={styles.statInfo}>
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaUniversity />
            </div>
            <div className={styles.statInfo}>
              <h3>{selectedModule ? 1 : 0}</h3>
              <p>Selected Module</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search modules by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={styles.twoColumnLayout}>
          {/* Left Column - Modules List */}
          <div className={styles.leftColumn}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaChalkboardTeacher className={styles.sectionIcon} />
                My Modules
              </h2>
              <p className={styles.sectionSubtitle}>Select a module to manage student enrollments</p>
            </div>

            <div className={styles.modulesList}>
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <div 
                    key={module.module_id} 
                    className={`${styles.moduleCard} ${selectedModule?.module_id === module.module_id ? styles.activeModule : ""}`}
                    onClick={() => setSelectedModule(module)}
                  >
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
                        <FaCalendarAlt className={styles.detailIcon} />
                        <span>{module.credits} Credits</span>
                      </div>
                    </div>
                    <div className={styles.moduleActions}>
                      <button 
                        className={styles.generateQRBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateQR();
                        }}
                      >
                        <FaQrcode /> Generate QR Session
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <FaBook className={styles.emptyIcon} />
                  <h3>No modules found</h3>
                  <p>Try adjusting your search or check if you have assigned modules</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Students in Selected Module */}
          <div className={styles.rightColumn}>
            {selectedModule ? (
              <>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <FaUserGraduate className={styles.sectionIcon} />
                    Students in {selectedModule.module_name}
                  </h2>
                  <button 
                    className={styles.enrollBtn}
                    onClick={() => setShowEnrollModal(true)}
                  >
                    <FaUserPlus /> Enroll Student
                  </button>
                </div>

                <div className={styles.studentsList}>
                  {loading ? (
                    <div className={styles.loadingState}>
                      <FaSpinner className={styles.spinner} />
                      <p>Loading students...</p>
                    </div>
                  ) : moduleStudents.length > 0 ? (
                    moduleStudents.map((student) => (
                      <div key={student.enrollment_id} className={styles.studentCard}>
                        <div className={styles.studentInfo}>
                          <div className={styles.studentAvatar}>
                            <FaUserGraduate />
                          </div>
                          <div className={styles.studentDetails}>
                            <h4>{student.student_name}</h4>
                            <p>{student.student_id_number}</p>
                            <p className={styles.enrolledDate}>Enrolled: {student.enrolled_date}</p>
                          </div>
                        </div>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => setShowRemoveModal({
                            enrollment_id: student.enrollment_id,
                            student_id: student.student_id,
                            student_name: student.student_name
                          })}
                          disabled={submitting}
                        >
                          <FaUserMinus /> Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyStudents}>
                      <FaUsers className={styles.emptyIcon} />
                      <h3>No students enrolled</h3>
                      <p>Click "Enroll Student" to add students to this module</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.selectModulePrompt}>
                <FaBook className={styles.promptIcon} />
                <h3>Select a Module</h3>
                <p>Choose a module from the left to manage student enrollments</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedModule && (
        <div className={styles.modalOverlay} onClick={() => setShowEnrollModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Enroll Student - {selectedModule.module_name}</h2>
              <button className={styles.modalClose} onClick={() => setShowEnrollModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.enrollSearch}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.availableStudentsList}>
                {filteredAvailableStudents.length > 0 ? (
                  filteredAvailableStudents.map((student) => (
                    <div key={student.student_id} className={styles.availableStudentCard}>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentAvatar}>
                          <FaUserGraduate />
                        </div>
                        <div className={styles.studentDetails}>
                          <h4>{student.name}</h4>
                          <p>{student.student_id_number}</p>
                          <p>{student.email}</p>
                        </div>
                      </div>
                      <button 
                        className={styles.enrollStudentBtn}
                        onClick={() => handleEnrollStudent(student)}
                        disabled={submitting}
                      >
                        <FaUserPlus /> Enroll
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyStudents}>
                    <FaUsers className={styles.emptyIcon} />
                    <h3>No available students</h3>
                    <p>All students are already enrolled in this module</p>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowEnrollModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {showRemoveModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRemoveModal(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Remove Student</h2>
              <button className={styles.modalClose} onClick={() => setShowRemoveModal(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteIcon}>
                <FaExclamationCircle />
              </div>
              <p>Remove <strong>{showRemoveModal.student_name}</strong> from <strong>{selectedModule?.module_name}</strong>?</p>
              <p className={styles.deleteWarning}>They will no longer be able to scan QR codes for this module.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowRemoveModal(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleRemoveStudent} disabled={submitting}>
                <FaTrash /> Remove Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Session Modal */}
      {showQRModal && selectedModule && (
        <div className={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create QR Session - {selectedModule.module_name}</h2>
              <button className={styles.modalClose} onClick={() => setShowQRModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Venue / Location *</label>
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
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={qrForm.start_time}
                    onChange={(e) => setQrForm({ ...qrForm, start_time: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={qrForm.end_time}
                    onChange={(e) => setQrForm({ ...qrForm, end_time: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Data Structures"
                  value={qrForm.topic}
                  onChange={(e) => setQrForm({ ...qrForm, topic: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Session Type</label>
                <select
                  value={qrForm.session_type}
                  onChange={(e) => setQrForm({ ...qrForm, session_type: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Exam">Exam</option>
                </select>
              </div>
              <div className={styles.infoNote}>
                <FaClock /> QR code will expire 3 hours after generation
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
    </div>
  );
}