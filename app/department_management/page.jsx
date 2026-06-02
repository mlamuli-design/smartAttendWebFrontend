"use client";

import React, { useState, useEffect } from "react";
import { 
  FaChalkboardTeacher, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaUniversity,
  FaEnvelope,
  FaIdCard,
  FaCheckCircle,
  FaExclamationCircle,
  FaPhone,
  FaCalendarAlt
} from "react-icons/fa";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";


export default function LecturerManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    employee_id: "",
    department_id: "",
    phone: "",
    specialization: "",
    join_date: "",
    is_active: true
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch departments and lecturers from database
  useEffect(() => {
    fetchDepartments();
    fetchLecturers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${IP}/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      showToast("Failed to load departments", "error");
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${IP}/lecturers`);
      if (response.ok) {
        const data = await response.json();
        setLecturers(data);
      } else {
        showToast("Failed to load lecturers", "error");
      }
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      showToast("Failed to load lecturers", "error");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.employee_id || !form.department_id) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const lecturerData = {
      name: form.name,
      email: form.email,
      employee_id: form.employee_id.toUpperCase(),
      department_id: parseInt(form.department_id),
      phone: form.phone || null,
      specialization: form.specialization || null,
      join_date: form.join_date || null,
      is_active: form.is_active
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`${IP}/lecturers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lecturerData)
        });
        if (response.ok) {
          showToast("Lecturer updated successfully!", "success");
          fetchLecturers();
          setShowModal(false);
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to update lecturer", "error");
        }
      } else {
        response = await fetch(`${IP}/lecturers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lecturerData)
        });
        if (response.ok) {
          showToast("Lecturer created successfully!", "success");
          fetchLecturers();
          setShowModal(false);
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to create lecturer", "error");
        }
      }
    } catch (error) {
      console.error("Error saving lecturer:", error);
      showToast("Failed to save lecturer", "error");
    }

    // Reset form
    setForm({
      name: "",
      email: "",
      employee_id: "",
      department_id: "",
      phone: "",
      specialization: "",
      join_date: "",
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (lecturer) => {
    setForm({
      name: lecturer.name,
      email: lecturer.email,
      employee_id: lecturer.employee_id,
      department_id: lecturer.department_id.toString(),
      phone: lecturer.phone || "",
      specialization: lecturer.specialization || "",
      join_date: lecturer.join_date ? lecturer.join_date.split('T')[0] : "",
      is_active: lecturer.is_active
    });
    setEditingId(lecturer.lecturer_id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        const response = await fetch(`${IP}:/lecturers/${deleteConfirm}`, {
          method: "DELETE"
        });
        if (response.ok) {
          showToast("Lecturer deleted successfully!", "success");
          fetchLecturers();
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to delete lecturer", "error");
        }
      } catch (error) {
        console.error("Error deleting lecturer:", error);
        showToast("Failed to delete lecturer", "error");
      }
      setDeleteConfirm(null);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.department_id === departmentId);
    return dept ? dept.department_name : "Unknown";
  };

  const filtered = lecturers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    getDepartmentName(l.department_id).toLowerCase().includes(search.toLowerCase()) ||
    (l.specialization && l.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { color: "#2ecc71", bg: "rgba(46, 204, 113, 0.15)", text: "Active" }
      : { color: "#c8102e", bg: "rgba(200, 16, 46, 0.15)", text: "Inactive" };
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingCard}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinnerRing}>
            <div className={styles.spinner} />
          </div>
          <FaSpinner className={styles.spinnerIcon} />
        </div>
        <div className={styles.loadingText}>
          <span className={styles.loadingMessage}>Loading modules</span>
          <div className={styles.loadingDots}>
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
        <p className={styles.loadingSubtext}>Please wait while we fetch your data</p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

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
              <FaChalkboardTeacher className={styles.titleIcon} />
              Lecturer Management
            </h1>
            <p className={styles.subtitle}>Manage all academic staff and lecturers across faculties</p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, email, employee ID, or faculty..."
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
          
          <button className={styles.addBtn} onClick={() => { 
            setEditingId(null); 
            setForm({ 
              name: "", 
              email: "", 
              employee_id: "", 
              department_id: "", 
              phone: "", 
              specialization: "", 
              join_date: "", 
              is_active: true 
            }); 
            setShowModal(true); 
          }}>
            <FaPlus /> Add New Lecturer
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaChalkboardTeacher />
            </div>
            <div className={styles.statInfo}>
              <h3>{lecturers.length}</h3>
              <p>Total Lecturers</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>{lecturers.filter(l => l.is_active === true).length}</h3>
              <p>Active Lecturers</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaUniversity />
            </div>
            <div className={styles.statInfo}>
              <h3>{departments.length}</h3>
              <p>Faculties</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaIdCard />
            </div>
            <div className={styles.statInfo}>
              <h3>{lecturers.filter(l => l.specialization).length}</h3>
              <p>Specializations</p>
            </div>
          </div>
        </div>

        {/* Lecturers Grid */}
        <div className={styles.coursesGrid}>
          {filtered.map((lecturer) => (
            <div key={lecturer.lecturer_id} className={styles.courseCard}>
              <div className={styles.courseHeader}>
                <div className={styles.courseCode}>{lecturer.employee_id}</div>
                <div className={styles.statusBadge} style={{ backgroundColor: getStatusBadge(lecturer.is_active).bg, color: getStatusBadge(lecturer.is_active).color }}>
                  {getStatusBadge(lecturer.is_active).text}
                </div>
              </div>
              <h3 className={styles.courseName}>{lecturer.name}</h3>
              <div className={styles.courseDetails}>
                <div className={styles.detailItem}>
                  <FaEnvelope className={styles.detailIcon} />
                  <span>{lecturer.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaUniversity className={styles.detailIcon} />
                  <span>{getDepartmentName(lecturer.department_id)}</span>
                </div>
                {lecturer.specialization && (
                  <div className={styles.detailItem}>
                    <FaIdCard className={styles.detailIcon} />
                    <span>{lecturer.specialization}</span>
                  </div>
                )}
                {lecturer.phone && (
                  <div className={styles.detailItem}>
                    <FaPhone className={styles.detailIcon} />
                    <span>{lecturer.phone}</span>
                  </div>
                )}
                {lecturer.join_date && (
                  <div className={styles.detailItem}>
                    <FaCalendarAlt className={styles.detailIcon} />
                    <span>Joined: {new Date(lecturer.join_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className={styles.courseActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(lecturer)}>
                  <FaEdit /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(lecturer.lecturer_id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <FaChalkboardTeacher className={styles.emptyIcon} />
              <h3>No lecturers found</h3>
              <p>Try adjusting your search or add a new lecturer</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Lecturer" : "Create New Lecturer"}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Thabo Dlamini"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="thabo.dlamini@uneswa.sz"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    placeholder="e.g., UNESWA001"
                    value={form.employee_id}
                    onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="text"
                    placeholder="+268 7612 3456"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Join Date</label>
                  <input
                    type="date"
                    value={form.join_date}
                    onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Faculty *</label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                  className={styles.formInput}
                >
                  <option value="">Select Faculty</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className={styles.formInput}
                  />
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
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSubmit}>
                <FaSave /> {editingId ? "Update Lecturer" : "Create Lecturer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              <p>Are you sure you want to delete this lecturer?</p>
              <p className={styles.deleteWarning}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                <FaTrash /> Delete Lecturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}