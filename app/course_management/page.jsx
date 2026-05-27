"use client";

import React, { useState, useEffect } from "react";
import { 
  FaBook, 
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
  FaClock
} from "react-icons/fa";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";
import { IP, PORT } from "../../config";


export default function CourseManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    course_name: "",
    course_code: "",
    department_id: "",
    duration_years: "",
    total_credits: "",
    is_active: true
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch departments and courses from database
  useEffect(() => {
    fetchDepartments();
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${IP}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      showToast("Failed to load courses", "error");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (!form.course_name || !form.course_code || !form.department_id || !form.duration_years) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const courseData = {
      course_name: form.course_name,
      course_code: form.course_code.toUpperCase(),
      department_id: parseInt(form.department_id),
      duration_years: parseInt(form.duration_years),
      total_credits: form.total_credits ? parseInt(form.total_credits) : null,
      is_active: form.is_active
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`${IP}/courses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData)
        });
        if (response.ok) {
          showToast("Course updated successfully!", "success");
          fetchCourses();
        }
      } else {
        response = await fetch(`${IP}/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData)
        });
        if (response.ok) {
          showToast("Course created successfully!", "success");
          fetchCourses();
        }
      }
    } catch (error) {
      console.error("Error saving course:", error);
      showToast("Failed to save course", "error");
    }

    setForm({ 
      course_name: "", 
      course_code: "", 
      department_id: "", 
      duration_years: "", 
      total_credits: "", 
      is_active: true 
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (course) => {
    setForm({
      course_name: course.course_name,
      course_code: course.course_code,
      department_id: course.department_id.toString(),
      duration_years: course.duration_years.toString(),
      total_credits: course.total_credits?.toString() || "",
      is_active: course.is_active
    });
    setEditingId(course.course_id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        const response = await fetch(`${IP}/courses/${deleteConfirm}`, {
          method: "DELETE"
        });
        if (response.ok) {
          showToast("Course deleted successfully!", "success");
          fetchCourses();
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        showToast("Failed to delete course", "error");
      }
      setDeleteConfirm(null);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.department_id === departmentId);
    return dept ? dept.department_name : "Unknown";
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { color: "#2ecc71", bg: "rgba(46, 204, 113, 0.15)", text: "Active" }
      : { color: "#c8102e", bg: "rgba(200, 16, 46, 0.15)", text: "Inactive" };
  };

  const filtered = courses.filter(c =>
    c.course_name.toLowerCase().includes(search.toLowerCase()) ||
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    getDepartmentName(c.department_id).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
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
              <FaBook className={styles.titleIcon} />
              Course Management
            </h1>
            <p className={styles.subtitle}>Manage all academic courses across faculties</p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by course name, code, or faculty..."
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
              course_name: "", 
              course_code: "", 
              department_id: "", 
              duration_years: "", 
              total_credits: "", 
              is_active: true 
            }); 
            setShowModal(true); 
          }}>
            <FaPlus /> Add New Course
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaBook />
            </div>
            <div className={styles.statInfo}>
              <h3>{courses.length}</h3>
              <p>Total Courses</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaCheckCircle />
            </div>
            <div className={styles.statInfo}>
              <h3>{courses.filter(c => c.is_active === true).length}</h3>
              <p>Active Courses</p>
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
              <FaLayerGroup />
            </div>
            <div className={styles.statInfo}>
              <h3>{courses.reduce((sum, c) => sum + (c.total_credits || 0), 0)}</h3>
              <p>Total Credits</p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className={styles.coursesGrid}>
          {filtered.map((course) => (
            <div key={course.course_id} className={styles.courseCard}>
              <div className={styles.courseHeader}>
                <div className={styles.courseCode}>{course.course_code}</div>
                <div className={styles.statusBadge} style={{ backgroundColor: getStatusBadge(course.is_active).bg, color: getStatusBadge(course.is_active).color }}>
                  {getStatusBadge(course.is_active).text}
                </div>
              </div>
              <h3 className={styles.courseName}>{course.course_name}</h3>
              <div className={styles.courseDetails}>
                <div className={styles.detailItem}>
                  <FaUniversity className={styles.detailIcon} />
                  <span>{getDepartmentName(course.department_id)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaClock className={styles.detailIcon} />
                  <span>{course.duration_years} {course.duration_years === 1 ? 'Year' : 'Years'}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaCode className={styles.detailIcon} />
                  <span>{course.total_credits || 0} Credits</span>
                </div>
              </div>
              <div className={styles.courseActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(course)}>
                  <FaEdit /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(course.course_id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <FaBook className={styles.emptyIcon} />
              <h3>No courses found</h3>
              <p>Try adjusting your search or add a new course</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Course" : "Create New Course"}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  value={form.course_name}
                  onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Course Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., BSCS"
                    value={form.course_code}
                    onChange={(e) => setForm({ ...form, course_code: e.target.value.toUpperCase() })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Duration (Years) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 4"
                    value={form.duration_years}
                    onChange={(e) => setForm({ ...form, duration_years: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Total Credits</label>
                  <input
                    type="number"
                    placeholder="e.g., 120"
                    value={form.total_credits}
                    onChange={(e) => setForm({ ...form, total_credits: e.target.value })}
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
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSubmit}>
                <FaSave /> {editingId ? "Update Course" : "Create Course"}
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
              <p>Are you sure you want to delete this course?</p>
              <p className={styles.deleteWarning}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                <FaTrash /> Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}