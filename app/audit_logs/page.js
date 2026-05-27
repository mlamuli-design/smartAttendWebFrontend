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
  FaEnvelope,
  FaIdCard,
  FaCheckCircle,
  FaExclamationCircle,
  FaUserGraduate,
  FaUpload,
  FaFileExcel,
  FaDownload,
  FaEye,
  FaUser,
  FaCalendarAlt,
    FaBook
} from "react-icons/fa";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";

export default function AdminStudentManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    student_id_number: "",
    email: "",
    course_id: "",
    enrollment_year: new Date().getFullYear().toString(),
    is_active: true
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showViewModal, setShowViewModal] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourseForImport, setSelectedCourseForImport] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${IP}/students`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students || []);
      } else {
        showToast(data.message || "Failed to fetch students", "error");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("Network error fetching students", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${IP}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Handle form submit (Create/Update)
  const handleSubmit = async () => {
    if (!form.name || !form.student_id_number || !form.email || !form.course_id) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const url = editingId 
        ? `${IP}/students/${editingId}`
        : `${IP}/students`;
      
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          student_id_number: form.student_id_number,
          email: form.email,
          course_id: parseInt(form.course_id),
          enrollment_year: parseInt(form.enrollment_year),
          is_active: form.is_active
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to save student", "error");
        setSubmitting(false);
        return;
      }

      showToast(editingId ? "Student updated successfully!" : "Student added successfully!", "success");
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      showToast("Network error saving student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (student) => {
    setForm({
      name: student.name,
      student_id_number: student.student_id_number,
      email: student.email,
      course_id: student.course_id?.toString() || "",
      enrollment_year: student.enrollment_year?.toString() || new Date().getFullYear().toString(),
      is_active: student.is_active
    });
    setEditingId(student.student_id);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${IP}/students/${deleteConfirm}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to delete student", "error");
        setSubmitting(false);
        return;
      }
      
      showToast("Student deleted successfully!", "success");
      setDeleteConfirm(null);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Network error deleting student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers: name, student_id_number, email
      const requiredHeaders = ['name', 'student_id_number', 'email'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        showToast(`Missing required columns: ${missingHeaders.join(', ')}`, "error");
        return;
      }
      
      const parsedStudents = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        if (values.length >= 3 && values[0] && values[1] && values[2]) {
          parsedStudents.push({
            name: values[headers.indexOf('name')],
            student_id_number: values[headers.indexOf('student_id_number')],
            email: values[headers.indexOf('email')],
            enrollment_year: new Date().getFullYear(),
            is_active: true
          });
        }
      }
      
      setCsvPreview(parsedStudents);
      // Reset course selection when new file is uploaded
      setSelectedCourseForImport("");
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  // Confirm CSV import
  const confirmCsvImport = async () => {
    if (csvPreview.length === 0) return;
    
    if (!selectedCourseForImport) {
      showToast("Please select a course for the students", "error");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${IP}/students/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          students: csvPreview,
          course_id: parseInt(selectedCourseForImport)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to import students", "error");
        setSubmitting(false);
        return;
      }
      
      if (data.imported > 0) {
        showToast(`${data.imported} students imported successfully! ${data.failed > 0 ? `${data.failed} failed.` : ''}`, "success");
      } else if (data.failed > 0) {
        showToast(`Import failed: ${data.errors?.slice(0, 2).join(', ')}`, "error");
      }
      
      setCsvPreview([]);
      setSelectedCourseForImport("");
      fetchStudents();
    } catch (error) {
      console.error("Error importing students:", error);
      showToast("Network error importing students", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ['name', 'student_id_number', 'email'];
    const sampleRow = ['John Doe', 'STU2024001', 'john.doe@uneswa.sz'];
    const csvContent = [headers, sampleRow].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setForm({
      name: "",
      student_id_number: "",
      email: "",
      course_id: "",
      enrollment_year: new Date().getFullYear().toString(),
      is_active: true
    });
    setEditingId(null);
  };

  // Filter students
  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (is_active) => {
    return is_active 
      ? { color: "#2ecc71", bg: "rgba(46, 204, 113, 0.15)", text: "Active" }
      : { color: "#c8102e", bg: "rgba(200, 16, 46, 0.15)", text: "Inactive" };
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? course.course_name : "Not Assigned";
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
              <FaUsers className={styles.titleIcon} />
              Student Management
            </h1>
            <p className={styles.subtitle}>Manage all students in the system - Add, Edit, Delete, and Import via CSV</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaUserGraduate />
            </div>
            <div className={styles.statInfo}>
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>{students.filter(s => s.is_active).length}</h3>
              <p>Active Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaBook />
            </div>
            <div className={styles.statInfo}>
              <h3>{courses.length}</h3>
              <p>Courses</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaCalendarAlt />
            </div>
            <div className={styles.statInfo}>
              <h3>{new Date().getFullYear()}</h3>
              <p>Current Year</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, student ID, or email..."
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
          
          <div className={styles.actionButtons}>
            <button className={styles.templateBtn} onClick={downloadTemplate}>
              <FaDownload /> Template
            </button>
            <label className={styles.uploadBtn}>
              <FaUpload /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
              <FaPlus /> Add Student
            </button>
          </div>
        </div>

        {/* CSV Preview */}
        {csvPreview.length > 0 && (
          <div className={styles.csvPreviewCard}>
            <div className={styles.csvPreviewHeader}>
              <h3><FaFileExcel /> CSV Preview - {csvPreview.length} students ready to import</h3>
              <div className={styles.csvActions}>

                       <button 
                className={styles.confirmCsvBtn} 
                onClick={confirmCsvImport} 
                disabled={submitting || !selectedCourseForImport}
              >
                <FaCheckCircle /> {submitting ? "Importing..." : "Confirm Import"}
              </button>
              
                <button className={styles.cancelCsvBtn} onClick={() => { setCsvPreview([]); setSelectedCourseForImport(""); }}>
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Course Selection Dropdown for Import */}
            <div className={styles.csvCourseSelection}>
              <label>
                <FaBook className={styles.selectionIcon} />
                Select Course for All Students *
              </label>
              <select
                value={selectedCourseForImport}
                onChange={(e) => setSelectedCourseForImport(e.target.value)}
                className={styles.courseSelect}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name} ({course.course_code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.csvPreviewTable}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.slice(0, 5).map((student, idx) => (
                    <tr key={idx}>
                      <td>{student.name}</td>
                      <td>{student.student_id_number}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
                  {csvPreview.length > 5 && (
                    <tr className={styles.moreRows}>
                      <td colSpan={3}>
                        + {csvPreview.length - 5} more students
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={styles.csvPreviewFooter}>
              <button 
                className={styles.confirmCsvBtn} 
                onClick={confirmCsvImport} 
                disabled={submitting || !selectedCourseForImport}
              >
                <FaCheckCircle /> {submitting ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading students...</p>
            </div>
          ) : (
            <table className={styles.studentTable}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Enrollment Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const statusStyle = getStatusBadge(student.is_active);
                  return (
                    <tr key={student.student_id}>
                      <td className={styles.studentIdCell}>{student.student_id_number}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{getCourseName(student.course_id)}</td>
                      <td>{student.enrollment_year}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.text}
                        </span>
                       </td>
                      <td className={styles.actionCells}>
                        <button className={styles.viewBtn} onClick={() => setShowViewModal(student)} title="View">
                          <FaEye />
                        </button>
                        <button className={styles.editBtn} onClick={() => handleEdit(student)} title="Edit">
                          <FaEdit />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(student.student_id)} title="Delete">
                          <FaTrash />
                        </button>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className={styles.emptyState}>
              <FaUsers className={styles.emptyIcon} />
              <h3>No students found</h3>
              <p>Try adjusting your search or add a new student</p>
            </div>
          )}
        </div>
      </main>

      {/* Student Modal (Create/Edit) - Same as before */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Student ID *</label>
                  <input
                    type="text"
                    placeholder="e.g., STU2024001"
                    value={form.student_id_number}
                    onChange={(e) => setForm({ ...form, student_id_number: e.target.value.toUpperCase() })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="student@uneswa.sz"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Course *</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className={styles.formInput}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Enrollment Year</label>
                  <input
                    type="number"
                    placeholder="e.g., 2024"
                    value={form.enrollment_year}
                    onChange={(e) => setForm({ ...form, enrollment_year: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
                  className={styles.formInput}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting}>
                <FaSave /> {editingId ? "Update Student" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal - Same as before */}
      {showViewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(null)}>
          <div className={styles.modalView} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Student Details</h2>
              <button className={styles.modalClose} onClick={() => setShowViewModal(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.viewBody}>
              <div className={styles.viewAvatar}>
                <FaUserGraduate />
              </div>
              <div className={styles.viewInfo}>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Name:</span>
                  <span>{showViewModal.name}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Student ID:</span>
                  <span>{showViewModal.student_id_number}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Email:</span>
                  <span>{showViewModal.email}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Course:</span>
                  <span>{getCourseName(showViewModal.course_id)}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Enrollment Year:</span>
                  <span>{showViewModal.enrollment_year}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Status:</span>
                  <span className={styles.statusBadge} style={{ backgroundColor: getStatusBadge(showViewModal.is_active).bg, color: getStatusBadge(showViewModal.is_active).color }}>
                    {getStatusBadge(showViewModal.is_active).text}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowViewModal(null)}>
                Close
              </button>
              <button className={styles.editBtnModal} onClick={() => { setShowViewModal(null); handleEdit(showViewModal); }}>
                <FaEdit /> Edit Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Same as before */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirm Delete</h2>
              <button className={styles.modalClose} onClick={() => setDeleteConfirm(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteIcon}>
                <FaExclamationCircle />
              </div>
              <p>Are you sure you want to delete this student?</p>
              <p className={styles.deleteWarning}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={submitting}>
                <FaTrash /> Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}