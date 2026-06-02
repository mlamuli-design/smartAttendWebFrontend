"use client";

import React, { useState, useEffect } from "react";
import { 
  FaCube, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaUniversity,
  FaCode,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle,
  FaChalkboardTeacher,
  FaCalendarAlt
} from "react-icons/fa";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";

export default function ModuleManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    module_name: "",
    module_code: "",
    department_id: "",
    course_id: "",
    lecturer_id: "",
    credits: "",
    description: "",
    is_active: true
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch all data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchLecturers();
    fetchModules();
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
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${IP}/courses`);
      if (response.ok) {
        const data = await response.json();
        // Ensure each course has a unique id
        const coursesWithUniqueIds = data.map((course, index) => ({
          ...course,
          unique_id: course.course_id || `temp_${index}`
        }));
        console.log("Fetched courses:", coursesWithUniqueIds);
        setCourses(coursesWithUniqueIds);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${IP}/lecturers`);
      if (response.ok) {
        const data = await response.json();
        setLecturers(data);
      }
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${IP}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      showToast("Failed to load modules", "error");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Auto-populate faculty when lecturer is selected
  const handleLecturerChange = (lecturerId) => {
    const selectedLecturer = lecturers.find(l => l.lecturer_id === parseInt(lecturerId));
    if (selectedLecturer) {
      setForm({ 
        ...form, 
        lecturer_id: lecturerId,
        department_id: selectedLecturer.department_id.toString(),
        course_id: "" // Reset course when lecturer/faculty changes
      });
    } else {
      setForm({ ...form, lecturer_id: lecturerId });
    }
  };

  // Filter courses based on selected department
  const getFilteredCourses = () => {
    if (!form.department_id) return [];
    return courses.filter(c => c.department_id === parseInt(form.department_id));
  };

  // Filter lecturers based on selected department
  const getFilteredLecturers = () => {
    if (!form.department_id) return lecturers;
    return lecturers.filter(l => l.department_id === parseInt(form.department_id) && l.is_active === true);
  };

  const handleSubmit = async () => {
    if (!form.module_name || !form.module_code || !form.department_id || !form.course_id || !form.lecturer_id || !form.credits) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const moduleData = {
      module_name: form.module_name,
      module_code: form.module_code.toUpperCase(),
      department_id: parseInt(form.department_id),
      course_id: parseInt(form.course_id),
      lecturer_id: parseInt(form.lecturer_id),
      credits: parseInt(form.credits),
      description: form.description || null,
      is_active: form.is_active
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`${IP}/modules/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moduleData)
        });
        if (response.ok) {
          showToast("Module updated successfully!", "success");
          fetchModules();
          setShowModal(false);
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to update module", "error");
        }
      } else {
        response = await fetch(`${IP}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moduleData)
        });
        if (response.ok) {
          showToast("Module created successfully!", "success");
          fetchModules();
          setShowModal(false);
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to create module", "error");
        }
      }
    } catch (error) {
      console.error("Error saving module:", error);
      showToast("Failed to save module", "error");
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setForm({
      module_name: "",
      module_code: "",
      department_id: "",
      course_id: "",
      lecturer_id: "",
      credits: "",
      description: "",
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (module) => {
    setForm({
      module_name: module.module_name,
      module_code: module.module_code,
      department_id: module.department_id?.toString() || "",
      course_id: module.course_id?.toString() || "",
      lecturer_id: module.lecturer_id?.toString() || "",
      credits: module.credits?.toString() || "",
      description: module.description || "",
      is_active: module.is_active
    });
    setEditingId(module.module_id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        const response = await fetch(`${IP}/modules/${deleteConfirm}`, {
          method: "DELETE"
        });
        if (response.ok) {
          showToast("Module deleted successfully!", "success");
          fetchModules();
        } else {
          const error = await response.json();
          showToast(error.message || "Failed to delete module", "error");
        }
      } catch (error) {
        console.error("Error deleting module:", error);
        showToast("Failed to delete module", "error");
      }
      setDeleteConfirm(null);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.department_id === departmentId);
    return dept ? dept.department_name : "Unknown";
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? course.course_name : "Unknown";
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l.lecturer_id === lecturerId);
    return lecturer ? lecturer.name : "Unknown";
  };

  const filtered = modules.filter(m =>
    m.module_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.module_code?.toLowerCase().includes(search.toLowerCase()) ||
    getDepartmentName(m.department_id).toLowerCase().includes(search.toLowerCase()) ||
    getLecturerName(m.lecturer_id).toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { color: "#2ecc71", bg: "rgba(46, 204, 113, 0.15)", text: "Active" }
      : { color: "#c8102e", bg: "rgba(200, 16, 46, 0.15)", text: "Inactive" };
  };

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
              <FaCube className={styles.titleIcon} />
              Module Management
            </h1>
            <p className={styles.subtitle}>Manage all academic modules across faculties and courses</p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by module name, code, faculty, or lecturer..."
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
          
          <button className={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
            <FaPlus /> Add New Module
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaCube />
            </div>
            <div className={styles.statInfo}>
              <h3>{modules.length}</h3>
              <p>Total Modules</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>{modules.filter(m => m.is_active === true).length}</h3>
              <p>Active Modules</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaChalkboardTeacher />
            </div>
            <div className={styles.statInfo}>
              <h3>{lecturers.filter(l => l.is_active === true).length}</h3>
              <p>Active Lecturers</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaLayerGroup />
            </div>
            <div className={styles.statInfo}>
              <h3>{modules.reduce((sum, m) => sum + (m.credits || 0), 0)}</h3>
              <p>Total Credits</p>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className={styles.coursesGrid}>
          {filtered.map((module) => (
            <div key={module.module_id || module.id} className={styles.courseCard}>
              <div className={styles.courseHeader}>
                <div className={styles.courseCode}>{module.module_code}</div>
                <div className={styles.statusBadge} style={{ backgroundColor: getStatusBadge(module.is_active).bg, color: getStatusBadge(module.is_active).color }}>
                  {getStatusBadge(module.is_active).text}
                </div>
              </div>
              <h3 className={styles.courseName}>{module.module_name}</h3>
              <div className={styles.courseDetails}>
                <div className={styles.detailItem}>
                  <FaUniversity className={styles.detailIcon} />
                  <span>{getDepartmentName(module.department_id)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaCode className={styles.detailIcon} />
                  <span>{getCourseName(module.course_id)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaChalkboardTeacher className={styles.detailIcon} />
                  <span>{getLecturerName(module.lecturer_id)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaLayerGroup className={styles.detailIcon} />
                  <span>{module.credits} Credits</span>
                </div>
              </div>
              <div className={styles.courseActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(module)}>
                  <FaEdit /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(module.module_id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <FaCube className={styles.emptyIcon} />
              <h3>No modules found</h3>
              <p>Try adjusting your search or add a new module</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Module" : "Create New Module"}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Module Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={form.module_name}
                  onChange={(e) => setForm({ ...form, module_name: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Module Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., CSC201"
                    value={form.module_code}
                    onChange={(e) => setForm({ ...form, module_code: e.target.value.toUpperCase() })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Credits *</label>
                  <input
                    type="number"
                    placeholder="e.g., 3"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Lecturer *</label>
                <select
                  value={form.lecturer_id}
                  onChange={(e) => handleLecturerChange(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="">Select Lecturer</option>
                  {lecturers
                    .filter(l => l.is_active === true)
                    .map((lecturer) => (
                      <option 
                        key={lecturer.lecturer_id || `lecturer_${lecturer.id || Math.random()}`} 
                        value={lecturer.lecturer_id}
                      >
                        {lecturer.name} ({lecturer.employee_id})
                      </option>
                    ))}
                </select>
                <small className={styles.formHint}>Faculty will be auto-detected from lecturer</small>
              </div>

              <div className={styles.formGroup}>
                <label>Faculty *</label>
                <select
                  value={form.department_id}
                  className={styles.formInput}
                  disabled
                >
                  <option value="">Auto-detected from lecturer</option>
                  {form.department_id && (
                    <option value={form.department_id}>
                      {getDepartmentName(parseInt(form.department_id))}
                    </option>
                  )}
                </select>
                <small className={styles.formHint}>Automatically populated when lecturer is selected</small>
              </div>

              <div className={styles.formGroup}>
                <label>Course *</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className={styles.formInput}
                  disabled={!form.department_id}
                >
                  <option value="">Select Course</option>
                  {getFilteredCourses().map((course) => (
                    <option 
                      key={course.course_id || course.unique_id || `course_${course.id || Math.random()}`} 
                      value={course.course_id}
                    >
                      {course.course_name} ({course.course_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  placeholder="Module description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.formInput}
                  rows="3"
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
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSubmit}>
                <FaSave /> {editingId ? "Update Module" : "Create Module"}
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
              <p>Are you sure you want to delete this module?</p>
              <p className={styles.deleteWarning}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                <FaTrash /> Delete Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}